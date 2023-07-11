import os
import pandas as pd
import shapely
import geopandas

# 4 columns representing bounds of the satellite data
LAT_NW = "sat_Lat-NW"
LON_NW = "sat_Lon-NW"
LAT_SE = "sat_Lat-SE"
LON_SE = "sat_Lon-SE"
RGB_SATELLITE_URL = os.environ.get(
    "ANDROMEDA_RGB_SATELLITE_URL",
    "https://raw.githubusercontent.com/Imageomics/Andromeda/main/datasets/satelliteData/satRgbFinal4.csv"
)
LANDCOVER_SATELLITE_URL = os.environ.get("ANDROMEDA_LANDCOVER_URL")


def make_shapely_box(row):
    return shapely.box(row[LAT_SE], row[LON_NW], row[LAT_NW], row[LON_SE])


def read_satellite_data(url):
    sat_df = pd.read_csv(url)
    sat_geo_series = geopandas.GeoSeries(sat_df.apply(make_shapely_box, axis=1))
    return sat_df, sat_geo_series


def find_satellite_records(sat_df, sat_geo_series, lat, long, column_prefix):
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


def merge_lat_long_csv_url(observations, lat_fieldname, long_fieldname, column_prefix, url):
    sat_df, sat_geo_series = read_satellite_data(url)
    observations.add_fieldnames(list(sat_df.columns))
    has_a_match = False
    for obs in observations.data:
        lat = obs[lat_fieldname]
        long = obs[long_fieldname]
        if lat and long:
            matches = find_satellite_records(sat_df, sat_geo_series, lat, long, column_prefix)
            if matches:
                if len(matches) > 1:
                    observations.add_warning("multiple_sat_matches")
                obs.update(matches[0])
                has_a_match = True
    if not has_a_match:
        observations.add_warning("no_sat_matches")


def add_satellite_rgb_data(observations, lat_fieldname, long_fieldname):
    merge_lat_long_csv_url(observations, lat_fieldname, long_fieldname, "sat", 
                           RGB_SATELLITE_URL)


def add_satellite_landcover_data(observations, lat_fieldname, long_fieldname):
    if LANDCOVER_SATELLITE_URL:
        merge_lat_long_csv_url(observations, lat_fieldname, long_fieldname, "land_type",
                               LANDCOVER_SATELLITE_URL)
    else:
        observations.add_warning("landcover_not_setup")
