import unittest
from unittest.mock import Mock, patch
from io import BytesIO
from main import app


class TestDataset(unittest.TestCase):
    @patch('main.DatasetStore')
    def test_create_dataset(self, mock_dataset_store):
        mock_dataset_store.return_value.create_dataset.return_value = Mock(
            id='9b4973f4-eba8-41b8-a3f9-acbadf49a2ca')

        client = app.test_client()
        result = client.post('/api/dataset/', data={
            "file": (BytesIO(b"stuff"), "file.csv")
        })
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.json, {"id": "9b4973f4-eba8-41b8-a3f9-acbadf49a2ca"})

    @patch('main.DatasetStore')
    def test_dimensional_reduction(self, mock_dataset_store):
        mock_dataset = Mock()
        mock_weights = { "B1": 0.4 }
        mock_coordinates = [{ "label":"p1", "x": 0.4, "y": 0.5 }]
        mock_dataset.dimensional_reduction.return_value = (mock_weights, mock_coordinates)
        mock_dataset_store.return_value.get_dataset.return_value = mock_dataset

        dataset_id = '9b4973f4-eba8-41b8-a3f9-acbadf49a2ca'
        client = app.test_client()
        result = client.post(f'/api/dataset/{dataset_id}/dimensional-reduction',
                             json={
                                "weights": { "B1": 0.4 },
                                "columnSettings": {
                                    "label": "Image_Label",
                                    "url": "Image_URL",
                                    "selected": ["R1","B1","G1"],
                                }
                             })
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.json, {
            "id": dataset_id,
            "weights": mock_weights,
            "images": mock_coordinates
        })

    @patch('main.DatasetStore')
    def test_inverse_dimensional_reduction(self, mock_dataset_store):
        mock_dataset = Mock()
        mock_weights = { "B1": 0.4 }
        mock_coordinates = [{ "label": "p1", "x": 0.4, "y": 0.5 }]
        mock_dataset.inverse_dimensional_reduction.return_value = (mock_weights, mock_coordinates)
        mock_dataset_store.return_value.get_dataset.return_value = mock_dataset

        dataset_id = '9b4973f4-eba8-41b8-a3f9-acbadf49a2ca'
        client = app.test_client()
        result = client.post(f'/api/dataset/{dataset_id}/inverse-dimensional-reduction',
                             json={
                                "images": [{ "label": "p1", "x": 0.1, "y": 0.1 }],
                                "columnSettings": {
                                    "label": "Image_Label",
                                    "url": "Image_URL",
                                    "selected": ["R1","B1","G1"],
                                }
                             })
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.json, {
            "id": dataset_id,
            "weights": mock_weights,
            "images": mock_coordinates
        })
