import unittest
from unittest.mock import Mock, patch
import os
from io import StringIO
import pandas as pd
from dataset import DatasetStore

CSV_CONTENT = """Image_Label,Image_Link,R1,G1,B1
p1,https://example.com/p1.jpg,50,80,20
p2,https://example.com/p2.jpg,100,110,60
p3,https://example.com/p3.jpg,40,20,10
"""


class TestDataset(unittest.TestCase):
    @patch('dataset.pd')
    @patch('dataset.uuid')
    def test_create_dataset(self, mock_uuid, mock_pd):
        mock_uuid.uuid4.return_value = "9b4973f4-eba8-41b8-a3f9-acbadf49a2ca"
        ds = DatasetStore(base_directory="tmp")
        expected_csv_path = os.path.join("tmp", "9b4973f4-eba8-41b8-a3f9-acbadf49a2ca.csv")
        user_file = Mock()

        # Test that create writes a CSV at the expected location
        dataset = ds.create_dataset(user_file)

        self.assertEqual(dataset.id, "9b4973f4-eba8-41b8-a3f9-acbadf49a2ca")
        user_file.save.assert_called_with(expected_csv_path)

        # Test that we read CSV where expected
        df = dataset.read_dataframe()

        self.assertEqual(df, mock_pd.read_csv.return_value)
        mock_pd.read_csv.assert_called_with(expected_csv_path)

    @patch('dataset.os')
    def test_dimensional_reduction(self, mock_os):
        mock_os.path.exists.return_value = True
        user_file = Mock()

        ds = DatasetStore(base_directory="tmp")
        dataset = ds.create_dataset(user_file)
        dataset = ds.get_dataset(dataset.id, column_settings={
            "label": "Image_Label",
            "url": "Image_Link",
            "selected": ["R1", "B1", "G1"]
        })
        def mock_read_csv():
            return pd.read_csv(StringIO(CSV_CONTENT))
        dataset.read_dataframe = mock_read_csv

        weights, image_coordinates = dataset.dimensional_reduction(weights={"all": 0.5})

        self.assertEqual(weights.keys(), set(["R1", "B1", "G1"]))
        self.assertEqual(len(image_coordinates), 3)
        self.assertEqual(image_coordinates[0].keys(), set(["x", "y", "label", "url"]))
        self.assertEqual(image_coordinates[0]["label"], "p1")
        self.assertEqual(image_coordinates[0]["url"], "https://example.com/p1.jpg")

    @patch('dataset.os')
    def test_inverse_inverse_dimensional_reduction(self, mock_os):
        mock_os.path.exists.return_value = True
        user_file = Mock()

        ds = DatasetStore(base_directory="tmp")
        dataset = ds.create_dataset(user_file)
        dataset = ds.get_dataset(dataset.id, column_settings={
            "label": "Image_Label",
            "url": "Image_Link",
            "selected": ["R1", "B1", "G1"]
        })        
        def mock_read_csv():
            return pd.read_csv(StringIO(CSV_CONTENT))
        dataset.read_dataframe = mock_read_csv

        weights, image_coordinates = dataset.inverse_dimensional_reduction(
            image_coordinates=[
                {"label": "p1", "x": 0.4, "y": 0.5},
                {"label": "p2", "x": 0.1, "y": 0.1},
            ])

        self.assertEqual(weights.keys(), set(["R1", "B1", "G1"]))
        self.assertEqual(len(image_coordinates), 2)
        self.assertEqual(image_coordinates[0].keys(), set(["x", "y", "label", "url"]))
        self.assertEqual(image_coordinates[0]["label"], "p1")
        self.assertEqual(image_coordinates[0]["url"], "https://example.com/p1.jpg")
