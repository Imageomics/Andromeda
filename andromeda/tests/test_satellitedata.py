import pandas as pd
import unittest
from unittest.mock import Mock, patch

from satellitedata import (
    add_satellite_rgb_data,
    add_satellite_landcover_data,
    RGB_SAT_CONFIG
)

def sample_rgb_dataframe():
    columns = ["sat_Lat-NW", "sat_Lon-NW", "sat_Lat-SE", "sat_Lon-SE", "Number"]
    data = [
        (40.332624,	-74.749758,	40.313732,	-74.707701, 111),
        (40.365821,	-74.76289,	40.345643,	-74.720636, 222),
        (31, 31, 27, 27, 333),
        (32, 32, 28, 28, 444),
    ]
    return pd.DataFrame.from_records(data, columns=columns)


def sample_landcover_dataframe():
    columns = ["land_Lat-NW", "land_Lon-NW", "land_Lat-SE", "land_Lon-SE", "Number"]
    data = [
        (40.332624,	-74.749758,	40.313732,	-74.707701, 111),
        (40.365821,	-74.76289,	40.345643,	-74.720636, 222),
        (31, 31, 27, 27, 333),
        (32, 32, 28, 28, 444),
    ]
    return pd.DataFrame.from_records(data, columns=columns)


def sample_observation_data():
    return [
        {
            "id": "p1",
            "Lat": 40.33,
            "Long": -74.73
        }, {
            "id": "p2",
            "Lat": 40.35,
            "Long": -74.75
        }, {
            "id": "p3",
            "Lat": 40.32,
            "Long": -74.75
        }
    ]


class TestSatelliteData(unittest.TestCase):
    @patch("satellitedata.pd")
    def test_add_satellite_rgb_data_distance(self, mock_pd):
        columns = ["sat_Lat-NW", "sat_Lon-NW", "sat_Lat-SE", "sat_Lon-SE", "Number"]
        data = [
            (31, 31, 27, 27, 111),
            (32, 32, 30, 30, 222),
        ]
        mock_pd.read_csv.return_value = pd.DataFrame.from_records(data, columns=columns)
        observation_data = [
            { # Center of 111
                "id": "p1",
                "Lat": 29,
                "Long": 29
            },
            { # Just outside of 111
                "id": "p2",
                "Lat": 27,
                "Long": 29
            },
            { # Center of of 222
                "id": "p3",
                "Lat": 31,
                "Long": 31
            },
        ]
        observations = Mock(data=observation_data)
        add_satellite_rgb_data(
            observations=observations,
            lat_fieldname='Lat',
            long_fieldname='Long')
        self.assertEqual(len(observations.data), 3)
        obs = observations.data[0]
        self.assertEqual(obs["id"], "p1")
        self.assertEqual(obs["Number"], 111)
        self.assertEqual(obs["sat_in"], 1)
        self.assertEqual(obs["sat_distance"], 0)
        obs = observations.data[1]
        self.assertEqual(obs["id"], "p2")
        self.assertEqual(obs["Number"], 111)
        self.assertEqual(obs["sat_in"], 0)
        self.assertEqual(obs["sat_distance"], 2.0)
        obs = observations.data[2]
        self.assertEqual(obs["id"], "p3")
        self.assertEqual(obs["Number"], 222)
        self.assertEqual(obs["sat_in"], 1)
        self.assertEqual(obs["sat_distance"], 0)
        observations.add_fieldnames.assert_called_with([
            'sat_Lat-NW', 'sat_Lon-NW', 'sat_Lat-SE', 'sat_Lon-SE', 'Number',
            'sat_in', 'sat_distance']
        )

    @patch("satellitedata.pd")
    def test_add_satellite_rgb_data(self, mock_pd):
        sat_df = sample_rgb_dataframe()
        mock_pd.read_csv.return_value = sat_df
        observations = Mock(data=sample_observation_data())
        add_satellite_rgb_data(
            observations=observations,
            lat_fieldname='Lat',
            long_fieldname='Long')
        self.assertEqual(len(observations.data), 3)
        self.assertEqual(observations.data[0]["id"], "p1")
        self.assertEqual(observations.data[0]["Number"], 111)
        self.assertEqual(observations.data[0]["sat_in"], 1)
        self.assertLess(observations.data[0]["sat_distance"], 0.1)
        self.assertEqual(observations.data[1]["id"], "p2")
        self.assertEqual(observations.data[1]["Number"], 222)
        self.assertEqual(observations.data[1]["sat_in"], 1)
        self.assertLess(observations.data[1]["sat_distance"], 0.1)
        self.assertEqual(observations.data[2]["id"], "p3")
        self.assertEqual(observations.data[2].get("Number"), 111)
        self.assertEqual(observations.data[2]["sat_in"], 0)
        self.assertLess(observations.data[2]["sat_distance"], 0.1)
        self.assertEqual(observations.add_warning.called, False)
        mock_pd.read_csv.assert_called_with(RGB_SAT_CONFIG.url)

    @patch("satellitedata.pd")
    def test_add_satellite_rgb_data_not_in_region(self, mock_pd):
        sat_df = sample_rgb_dataframe()
        mock_pd.read_csv.return_value = sat_df
        unmatched_lat_long_data = [{
            "id": "p3",
            "Lat": 40.32,
            "Long": -74.75
        }]
        observations = Mock(data=unmatched_lat_long_data)
        add_satellite_rgb_data(
            observations=observations,
            lat_fieldname='Lat',
            long_fieldname='Long')
        self.assertEqual(len(observations.data), 1)
        self.assertEqual(observations.data[0]["id"], "p3")
        self.assertEqual(observations.data[0].get("Number"), 111)
        self.assertEqual(observations.data[0]["sat_in"], 0)
        self.assertEqual(observations.add_warning.called, False)

    @patch("satellitedata.pd")
    def test_add_satellite_rgb_data_duplicates(self, mock_pd):
        sat_df = sample_rgb_dataframe()
        mock_pd.read_csv.return_value = sat_df
        unmatched_lat_long_data = [{
            "id": "p3",
            "Lat": 30,
            "Long": 30
        }]
        observations = Mock(data=unmatched_lat_long_data)
        add_satellite_rgb_data(
            observations=observations,
            lat_fieldname='Lat',
            long_fieldname='Long')
        self.assertEqual(len(observations.data), 1)
        self.assertEqual(observations.data[0]["id"], "p3")
        self.assertEqual(observations.data[0].get("Number"), 444)
        self.assertEqual(observations.add_warning.called, False)

    @patch("satellitedata.time")
    @patch("satellitedata.get_landcoverage_classification")
    def test_add_satellite_landcover_data(self, mock_get_lc_classification, mock_time):
        mock_get_lc_classification.side_effect = [
            {'A_small': 0.426},
            {'A_small': 0.326},
            {'A_small': 0.226},
        ]
        observations = Mock(data=sample_observation_data())
        add_satellite_landcover_data(
            observations=observations,
            lat_fieldname='Lat',
            long_fieldname='Long')
        self.assertEqual(len(observations.data), 3)
        self.assertEqual(observations.data[0]["id"], "p1")
        self.assertEqual(observations.data[0]["A_small"], 0.426)
        self.assertEqual(observations.data[1]["id"], "p2")
        self.assertEqual(observations.data[1]["A_small"], 0.326)
        self.assertEqual(observations.data[2]["id"], "p3")
        self.assertEqual(observations.data[2]["A_small"], 0.226)
        self.assertEqual(observations.add_warning.called, False)
