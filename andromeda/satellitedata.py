import os
import pandas as pd
import shapely
import geopandas


class SatConfig(object):
    def __init__(self, column_prefix, fields, url_env_variable, url_default):
        self.column_prefix = column_prefix
        self.fields = fields
        self.url = os.environ.get(url_env_variable, url_default)


RGB_SAT_CONFIG = SatConfig(
    column_prefix="sat",
    fields={ # fieldnames in the CSV representing bounds of the satellite data
        "LAT_NW": "sat_Lat-NW",
        "LON_NW": "sat_Lon-NW",
        "LAT_SE": "sat_Lat-SE",
        "LON_SE": "sat_Lon-SE"
    },
    url_env_variable="ANDROMEDA_RGB_SATELLITE_URL",
    url_default="https://raw.githubusercontent.com/Imageomics/Andromeda/main/datasets/satelliteData/satRgbFinal4.csv"
)

LANDCOVER_SAT_CONFIG = SatConfig(
    column_prefix="land",
    fields={ # fieldnames in the CSV representing bounds of the satellite data
        "LAT_NW": "land_Lat-NW",
        "LON_NW": "land_Lon-NW",
        "LAT_SE": "land_Lat-SE",
        "LON_SE": "land_Lon-SE"
    },
    url_env_variable="ANDROMEDA_LANDCOVER_URL",
    url_default="https://raw.githubusercontent.com/Imageomics/Andromeda/landcover-changes/datasets/satelliteData/landcover-nj-2023-7-12.csv"
)


def make_shapely_box(row, fields):
    lat_se = fields["LAT_SE"]
    lon_nw = fields["LON_NW"]
    lat_nw = fields["LAT_NW"]
    lon_se = fields["LON_SE"]
    return shapely.box(row[lat_se], row[lon_nw], row[lat_nw], row[lon_se])


def read_satellite_data(config):
    sat_df = pd.read_csv(config.url)
    box_df = sat_df.apply(make_shapely_box, axis=1, fields=config.fields)
    sat_geo_series = geopandas.GeoSeries(box_df)
    return sat_df, sat_geo_series


def find_satellite_records(sat_df, sat_geo_series, lat, long, config):
    column_prefix = config.column_prefix
    point = shapely.Point(lat, long)
    # Compute distances to the center of all satellite regions to our point
    distances = sat_geo_series.centroid.distance(point)

    # Find the region(s) that have the minimum distance to the point
    min_distance = distances.min()
    is_min_distance = distances == min_distance
    matches = sat_df[is_min_distance].copy()
    matched_series = sat_geo_series[is_min_distance]

    # Add `in` column with values of 1 or 0 if the point is within the region
    matches[f"{column_prefix}_in"] = matched_series.contains(point).astype(int)
    # Add `distance` column with value of distance from the point to the region centroid
    matches[f"{column_prefix}_distance"] = matched_series.centroid.distance(point)

    return matches.to_dict(orient="records")


def merge_lat_long_csv_url(observations, lat_fieldname, long_fieldname, config):
    sat_df, sat_geo_series = read_satellite_data(config)
    column_prefix = config.column_prefix
    new_fieldnames = list(sat_df.columns) + [f"{column_prefix}_in", f"{column_prefix}_distance"]
    observations.add_fieldnames(new_fieldnames)
    has_a_match = False
    for obs in observations.data:
        lat = obs[lat_fieldname]
        long = obs[long_fieldname]
        if lat and long:
            matches = find_satellite_records(sat_df, sat_geo_series, lat, long, config)
            if matches:
                if len(matches) > 1:
                    observations.add_warning("multiple_sat_matches")
                obs.update(matches[0])
                has_a_match = True
    if not has_a_match:
        observations.add_warning("no_sat_matches")


def add_satellite_rgb_data(observations, lat_fieldname, long_fieldname):
    merge_lat_long_csv_url(observations, lat_fieldname, long_fieldname,
                           RGB_SAT_CONFIG)


def add_satellite_landcover_data(observations, lat_fieldname, long_fieldname):
    merge_lat_long_csv_url(observations, lat_fieldname, long_fieldname,
                            LANDCOVER_SAT_CONFIG)
