import unittest
from unittest.mock import Mock, patch
from io import BytesIO
from main import app


class TestDataset(unittest.TestCase):
    @patch("main.DatasetStore")
    def test_create_dataset(self, mock_dataset_store):
        mock_dataset_store.return_value.create_dataset.return_value = Mock(
            id="9b4973f4-eba8-41b8-a3f9-acbadf49a2ca"
        )

        client = app.test_client()
        result = client.post(
            "/api/dataset/", data={"file": (BytesIO(b"stuff"), "file.csv")}
        )
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.json, {"id": "9b4973f4-eba8-41b8-a3f9-acbadf49a2ca"})

    @patch("main.DatasetStore")
    def test_dimensional_reduction(self, mock_dataset_store):
        mock_dataset = Mock()
        mock_weights = {"B1": 0.4}
        mock_coordinates = [{"label": "p1", "x": 0.4, "y": 0.5}]
        mock_dataset.dimensional_reduction.return_value = (
            mock_weights,
            mock_coordinates,
        )
        mock_dataset_store.return_value.get_dataset.return_value = mock_dataset

        dataset_id = "9b4973f4-eba8-41b8-a3f9-acbadf49a2ca"
        client = app.test_client()
        result = client.post(
            f"/api/dataset/{dataset_id}/dimensional-reduction",
            json={
                "weights": {"B1": 0.4},
                "columnSettings": {
                    "label": "Image_Label",
                    "url": "Image_URL",
                    "selected": ["R1", "B1", "G1"],
                },
            },
        )
        self.assertEqual(result.status_code, 200)
        self.assertEqual(
            result.json,
            {"id": dataset_id, "weights": mock_weights, "images": mock_coordinates},
        )

    @patch("main.DatasetStore")
    def test_inverse_dimensional_reduction(self, mock_dataset_store):
        mock_dataset = Mock()
        mock_weights = {"B1": 0.4}
        mock_coordinates = [{"label": "p1", "x": 0.4, "y": 0.5}]
        mock_dataset.inverse_dimensional_reduction.return_value = (
            mock_weights,
            mock_coordinates,
        )
        mock_dataset_store.return_value.get_dataset.return_value = mock_dataset

        dataset_id = "9b4973f4-eba8-41b8-a3f9-acbadf49a2ca"
        client = app.test_client()
        result = client.post(
            f"/api/dataset/{dataset_id}/inverse-dimensional-reduction",
            json={
                "images": [{"label": "p1", "x": 0.1, "y": 0.1}],
                "columnSettings": {
                    "label": "Image_Label",
                    "url": "Image_URL",
                    "selected": ["R1", "B1", "G1"],
                },
            },
        )
        self.assertEqual(result.status_code, 200)
        self.assertEqual(
            result.json,
            {"id": dataset_id, "weights": mock_weights, "images": mock_coordinates},
        )

    @patch("main.get_inaturalist_observations")
    def test_get_inaturalist(self, mock_get_inaturalist_observations):
        observations = [{"Image_Label": "p1"}]
        warnings = ["missing_lat_long"]
        mock_get_inaturalist_observations.return_value = (observations, warnings)
        client = app.test_client()
        result = client.get(f"/api/inaturalist/bob")
        self.assertEqual(result.status_code, 200)
        self.assertEqual(
            result.json,
            {
                "data": [{"Image_Label": "p1"}],
                "user_id": "bob",
                "warnings": ["missing_lat_long"],
            },
        )

    @patch("main.get_inaturalist_observations")
    def test_get_inaturalist_csv(self, mock_get_inaturalist_observations):
        observations = [{"Image_Label": "p1"}]
        warnings = ["missing_lat_long"]
        mock_get_inaturalist_observations.return_value = (observations, warnings)
        client = app.test_client()
        result = client.get(f"/api/inaturalist/bob?format=csv")
        self.assertEqual(result.status_code, 200)
        self.assertEqual(
            result.text.strip(),
            "Image_Label,Image_Link,Species,User,Date,Time,Seconds,Place,Lat,Long\n"
            + "p1,,,,,,,,,",
        )

    @patch("main.get_inaturalist_observations")
    def test_get_inaturalist_xml(self, mock_get_inaturalist_observations):
        mock_get_inaturalist_observations.return_value = ([], [])
        client = app.test_client()
        result = client.get(f"/api/inaturalist/bob?format=xml")
        self.assertEqual(result.status_code, 400)
        self.assertEqual(result.json.get("description"), "Unsupported format parameter value xml")
