import unittest
import datetime
from unittest.mock import patch
from inaturalist import (
    get_inaturalist_fieldnames,
    get_inaturalist_observations,
    create_csv_str,
)


class TestINaturalist(unittest.TestCase):
    @patch("inaturalist.get_observations")
    def test_get_inaturalist_observations(self, mock_get_observations):
        expected_columns = [
            "Image_Label",
            "Image_Link",
            "Species",
            "User",
            "Date",
            "Time",
            "Seconds",
            "Place",
            "Lat",
            "Long",
        ]
        item = {
            "photos": [{"url": "https://example.com/p1_square.png"}],
            "p1": ["ABC"],
            "observed_on": [datetime.datetime(2023, 6, 17, 16, 40)],
            "location": [35.3299475067, -84.1795960441],
            "place_guess": "Duke University",
            "user": {"login": "bob"},
            "species_guess": "Equus grevyi",
        }
        mock_get_observations.return_value = {"results": [item]}

        obs, warnings = get_inaturalist_observations(user_id="user-1")

        self.assertEqual(len(obs), 1)
        first_obs = obs[0]
        self.assertEqual(first_obs.keys(), set(expected_columns))
        self.assertEqual(first_obs["Image_Label"], "p1")
        self.assertEqual(first_obs["Image_Link"], "https://example.com/p1_medium.png")
        self.assertEqual(first_obs["Species"], "Equus grevyi")
        self.assertEqual(first_obs["Seconds"][0], 60000)
        self.assertEqual(first_obs["Place"], "Duke University")
        self.assertEqual(first_obs["Lat"], 35.3299475067)
        self.assertEqual(first_obs["Long"], -84.1795960441)
        self.assertEqual(warnings, [])

    @patch("inaturalist.get_observations")
    def test_get_inaturalist_observations_lat_lon_warning(self, mock_get_observations):
        item = {
            "photos": [{"url": "https://example.com/p1_square.png"}],
            "p1": ["ABC"],
            "observed_on": [datetime.datetime(2023, 6, 17, 16, 40)],
            "place_guess": "Duke University",
            "user": {"login": "bob"},
            "species_guess": "Equus grevyi",
        }

        mock_get_observations.return_value = {"results": [item]}

        obs, warnings = get_inaturalist_observations(user_id="user-1")
        self.assertEqual(len(obs), 1)
        self.assertEqual(warnings, ["missing_lat_long"])

    def test_get_inaturalist_fieldnames(self):
        expected_names = [
            "Image_Label",
            "Image_Link",
            "Species",
            "User",
            "Date",
            "Time",
            "Seconds",
            "Place",
            "Lat",
            "Long",
        ]
        self.assertEqual(get_inaturalist_fieldnames(), expected_names)

    def test_create_csv_str(self):
        observations = [
            {
                "Image_Label": "p1",
                "Image_Link": "https://example.com/p1.png",
            }
        ]
        result = create_csv_str(["Image_Label", "Image_Link"], observations)
        self.assertEqual(
            result.strip(), "Image_Label,Image_Link\np1,https://example.com/p1.png"
        )
