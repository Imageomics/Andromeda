import pandas as pd
from arcgis.gis import GIS
from arcgis.features import FeatureLayer
from arcgis.geometry import Polygon, filters, project, intersect, areas_and_lengths

### Ultimate goal is to return percentage of each type of cover within the 1/2-mile box around the image's lat/lon.
### Will be added to the type of cover columns within the DataFrame.

# Fixed distance for boxes center on image lat/lon
BOUNDING_RADIUS = 0.25
# Convert distance to degrees (approx)
LAT_BOUNDING_RADIUS_DEG = BOUNDING_RADIUS / 69.0 # 69 miles per degree at 38 degrees North Latitude
LON_BOUNDING_RADIUS_DEG = BOUNDING_RADIUS / 54.6 # 54.6 miles per degree at 38 degrees North Latitude for longitudinal directions


# Reference map from ArcGIS which utilizes the Land Use/Land Cover of New Jersey 2015 ArcGIS Layer from NJDEP Bureau of GIS 
# URL for Layer information: https://mapsdep.nj.gov/arcgis/rest/services/Features/Land_lu/MapServer/13
# Credit/Disclaimer: This map was developed using New Jersey Department of Environmental Protection Geographic Information System digital data, but this secondary product has not been verified by NJDEP and is not state-authorized or endorsed.
# Web map ID for map utilizign the above layer: https://www.arcgis.com/home/search.html?restrict=false&sortField=relevance&sortOrder=desc&searchTerm=2705228b2b154d0a906ef7a54e533fac#content
WEBMAP_ID = "2705228b2b154d0a906ef7a54e533fac"

def get_layer(username, password):
    '''
    Function to retrieve the Feature Layer.
    
    Parameters:
    -----------

    Returns:
    --------
    
    '''
    # Authenticate with ArcGIS Online
    gis = GIS("https://www.arcgis.com", username, password)

    # Access the webmap item by ID and get operational layers from the data
    webmap_item = gis.content.get(WEBMAP_ID)
    webmap_data = webmap_item.get_data()
    operational_layers = webmap_data["operationalLayers"]

    # URL of the operational layer
    layer_url = operational_layers[0].get('url')

    # Access the layer
    layer = FeatureLayer(layer_url)
    return layer


def get_area_of_interest(lat, lon):
    '''
    Function to generate the area of interest Polygon based on image latitude and longitude.

    Parameters:
    -----------

    Returns:
    --------
    
    '''
    # Define boundary square around the coordinates
    min_lat = lat - LAT_BOUNDING_RADIUS_DEG
    max_lat = lat + LAT_BOUNDING_RADIUS_DEG
    min_lon = lon - LON_BOUNDING_RADIUS_DEG
    max_lon = lon + LON_BOUNDING_RADIUS_DEG

    # Polygon representing the area of interest
    # First coordinate matches last in rings of Polygons
    # Spatial Reference WKID 4326 corresponds to the WGS84 GCS (uses Earth's center as coordinate origin, not surface point)
    area_of_interest = Polygon({
                        "rings": [[[min_lon, min_lat], 
                                [min_lon, max_lat], 
                                [max_lon, max_lat], 
                                [max_lon, min_lat], 
                                [min_lon, min_lat]]],
                        "spatialReference": {"wkid": 4326}
    })
    return area_of_interest

def get_aoi_feature_areas(layer, aoi):
    '''
    Function to collect features within area of interest.

    Prameters:
    ----------
    layer - Map layer.
    aoi - Area of interest (1/2-mile box around image lat/lon).

    Returns:
    --------
    feature_areas - DataFrame with information for all feature labels and the area of their intersection with the area of interest (sq. meters).
    
    '''
    # Check spatial reference of AOI (WKID 4326)
    aoi_spatial_ref = aoi.spatial_reference['wkid']

    # Query the layer for features that intersect with the area of interest
    feature_set = layer.query(geometry_filter = filters.intersects(aoi))
    
    # Collect feature labels and their areas for all features in feature_set into DataFrame with Object_ID as unique identifier
    # Acres is full acreage of the region
    # Intersect_Area is the area of the intersection of the region with the area of interest, measured in square meters
    feature_areas = pd.DataFrame(columns=['Object_ID', 'Region', 'Acres', 'Intersect_Area']) 
    for feature in feature_set.features:
        feature_geometry = feature.geometry
        object_id = feature.attributes['OBJECTID']
        region_label = feature.attributes['LABEL15']
        region_acres = feature.attributes['ACRES']
        feature_spatial_ref = feature_geometry['spatialReference']['wkid'] # WKID 102100, original WGS1984 Web Mercator projection
        
        # Match spatial refs
        feature_geometry = project(geometries = [feature_geometry],
                                    in_sr = feature_spatial_ref,
                                    out_sr = aoi_spatial_ref)[0]
        spatial_ref = aoi_spatial_ref # {'wkid': 4326}

        # Get intersection
        intersection = intersect(spatial_ref, 
                                 [aoi], 
                                 feature_geometry)
        # Get area of intersetion
        area = areas_and_lengths(polygons = intersection[0], 
                                    length_unit = 9001, # meters
                                    area_unit = 9001, 
                                    calculation_type = 'preserveShape', 
                                    spatial_ref = spatial_ref)
        # Add row to DataFrame
        feature_areas.loc[len(feature_areas)] = {'Object_ID': object_id, 
                                                 'Region': region_label, 
                                                 'Acres': region_acres, 
                                                 'Intersect_Area': area['areas'][0]}

    return feature_areas

def get_landcover_percentages(feature_areas):
    '''
    Function to determine percentage of area of interest covered by each land cover of interest.
    
    Parameters:
    -----------

    Returns:
    --------

    '''
    for region in feature_areas.Region.unique():
        region_sum = feature_areas.loc[feature_areas.Region == region, 'Intersect_Area'].sum()
        feature_areas.loc[feature_areas.Region == region, 'Region_Intersect_Total'] = region_sum

    return feature_areas
