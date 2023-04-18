import unittest
from io import StringIO
import pandas as pd
from andromeda import normalized_df, stress, dimension_reduction, inverse_DR


class TestAndromeda(unittest.TestCase):
    def test_normalized_df(self):
        data = [
            ("p1", 'https://example.com/p1.jpg', 1.0, 100.0, 'A'),
            ("p2", 'https://example.com/p2.jpg', 2.0, 50.0, 'B'),
            ("p3", 'https://example.com/p3.jpg', 3.0, 0.0, 'C'),
        ]
        df = pd.DataFrame(data, columns=['Image_Label', 'Image_Link', 'Count', 'Weight', 'Category'])

        result = normalized_df(df)

        self.assertEqual(result.index.to_list(), ['p1', 'p2', 'p3'])
        # only numeric columns are kept
        self.assertEqual(result.columns.to_list(), ['Count', 'Weight'])
        # values are normalized to range +/- 1
        self.assertEqual(result['Count'].to_list(), [-1.0, 0.0, 1.0])
        self.assertEqual(result['Weight'].to_list(), [1.0, 0.0, -1.0])

    def test_stress(self):
        dist_hd = pd.DataFrame([2, 4])
        dist_2d = pd.DataFrame([1, 2])
        result = stress(dist_hd, dist_2d)
        self.assertEqual(result.to_list(), [0.25])

    def test_dimension_reduction(self):
        # TODO replace with better dataset
        csv_text = """Image_Label,Image_Link,R1,G1,B1
p1,https://example.com/p1.jpg,50,80,20
p2,https://example.com/p2.jpg,100,110,60
"""
        df = pd.read_csv(StringIO(csv_text))
        ndf = normalized_df(df)
        weight_vals = [0.00001] * len(ndf.columns)
        weights = pd.Series(weight_vals, index=ndf.columns, name="Weight")
        df_2D = dimension_reduction(ndf, weights)
        self.assertEqual(df_2D.index.to_list(), ['p1', 'p2'])
        self.assertEqual(df_2D.x.round(1).to_list(), [0.0, 0.0])
        self.assertEqual(df_2D.y.round(1).to_list(), [0.7, -0.7])

    def test_inverse_DR(self):
        # TODO replace with better dataset
        csv_text = """Image_Label,Image_Link,R1,G1,B1
p1,https://example.com/p1.jpg,50,80,20
p2,https://example.com/p2.jpg,100,110,60
"""
        df = pd.read_csv(StringIO(csv_text))
        ndf = normalized_df(df)
        data = [
            ("p1", 0.5, 0.0),
            ("p2", 0.0, 0.5),
        ]
        df_2d = pd.DataFrame(data, columns=['Image_Label', 'x', 'y'])
        df_2d.set_index('Image_Label', inplace = True)
        result = inverse_DR(ndf, df_2d)
        print(result)
        self.assertEqual(result.index.to_list(), ['R1', 'G1', 'B1'])
        color_sum = result.R1 + result.G1 + result.B1
        self.assertTrue(color_sum > 0.0)
        self.assertTrue(color_sum < 1.0)

if __name__ == '__main__':
    unittest.main()
