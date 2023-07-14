import os
import pandas as pd
from arcgis.gis import GIS
from arcgis.features import FeatureLayer
from arcgis.geometry import Polygon, filters, project, intersect, areas_and_lengths

### Ultimate goal is to return percentage of each type of cover within the 1/2-mile box around the image's lat/lon.
### Will be added to the type of cover columns within the DataFrame.

## Region bins: Grassy, Dense Wood, Woody, Suburban, Watery, Urban, Agricultural
# Grassy areas (pastures and school yards as well as golf courses):
GRASSY = ['ATHLETIC FIELDS (SCHOOLS)',  
            'CEMETERY',
            'CROPLAND AND PASTURELAND',
            'OLD FIELD (< 25% BRUSH COVERED)',
            'RECREATIONAL LAND'
            ]
# Dense woody areas (forests that are hardwood [deciduous] and soft wood [coniferous] and mixed:
DENSE_WOOD = ['CONIFEROUS FOREST (>50% CROWN CLOSURE)',
                'DECIDUOUS FOREST (>50% CROWN CLOSURE)',
                'MIXED FOREST (>50% CONIFEROUS WITH >50% CROWN CLOSURE)',
                'MIXED FOREST (>50% DECIDUOUS WITH >50% CROWN CLOSURE)'
                ]
# Woody areas (< 50% tree cover and shrublands where grass shows through but still lots of tall or short trees:
WOODY = ['CONIFEROUS BRUSH/SHRUBLAND',
        'CONIFEROUS FOREST (10-50% CROWN CLOSURE)',  
        'DECIDUOUS BRUSH/SHRUBLAND',
        'DECIDUOUS FOREST (10-50% CROWN CLOSURE)',
        'MIXED DECIDUOUS/CONIFEROUS BRUSH/SHRUBLAND',
        'MIXED FOREST (>50% CONIFEROUS WITH 10-50% CROWN CLOSURE)',
        'MIXED FOREST (>50% DECIDUOUS WITH 10-50% CROWN CLOSURE)'
        ]
# Suburban lawns (grassy areas with houses and gardens full of potential flowers; don’t need single or multiple dwelling differentiation, though):
SUBURBAN = ['MIXED RESIDENTIAL',
            'RESIDENTIAL, RURAL, SINGLE UNIT',
            'RESIDENTIAL, SINGLE UNIT, LOW DENSITY',
            'RESIDENTIAL, SINGLE UNIT, MEDIUM DENSITY'
            ]
# Watery areas and their associated wild areas that will contain some riverine grass and trees:
WATERY = ['AGRICULTURAL WETLANDS (MODIFIED)',
            'ARTIFICIAL LAKES',
            'CONIFEROUS SCRUB/SHRUB WETLANDS', 
            'CONIFEROUS WOODED WETLANDS',
            'DECIDUOUS SCRUB/SHRUB WETLANDS',
            'DECIDUOUS WOODED WETLANDS',
            'DISTURBED WETLANDS (MODIFIED)',
            'HERBACEOUS WETLANDS',
            'MANAGED WETLAND IN BUILT-UP MAINTAINED REC AREA',
            'MANAGED WETLAND IN MAINTAINED LAWN GREENSPACE',
            'MIXED SCRUB/SHRUB WETLANDS (CONIFEROUS DOM.)',
            'MIXED SCRUB/SHRUB WETLANDS (DECIDUOUS DOM.)',
            'MIXED WOODED WETLANDS (DECIDUOUS DOM.)',
            'NATURAL LAKES',
            'PHRAGMITES DOMINATE INTERIOR WETLANDS',
            'STORMWATER BASIN',
            'STREAMS AND CANALS'
            ]
# Areas with minimal natural habitats—urban areas (city centers, commercial sprawl, shopping centers, malls, 
# plenty of parking lots with gravel or blacktop (few potential flowers)).  
# This is a catch all category where flowers will be rare:
URBAN = ['AIRPORT FACILITIES',
        'ALTERED LANDS',
        'BRIDGE OVER WATER',
        'COMMERCIAL/SERVICES',
        'EXPOSED FLATS',
        'EXTRACTIVE MINING',
        'INDUSTRIAL',
        'MAJOR ROADWAY',
        'MIXED TRANSPORTATION CORRIDOR OVERLAP AREA',
        'MIXED URBAN OR BUILT-UP LAND',
        'OTHER URBAN OR BUILT-UP LAND',
        'RAILROADS',
        'RESIDENTIAL, HIGH DENSITY OR MULTIPLE DWELLING',
        'STADIUM, THEATERS, CULTURAL CENTERS AND ZOOS',
        'TRANSITIONAL AREAS',
        'TRANSPORTATION/COMMUNICATION/UTILITIES',
        'UPLAND RIGHTS-OF-WAY DEVELOPED',
        'UPLAND RIGHTS-OF-WAY UNDEVELOPED',
        'WETLAND RIGHTS-OF-WAY'
        ]
# Agricultural -- distinct from pasture, which should be grassy.
AGRICULTURAL = ['ORCHARDS/VINEYARDS/NURSERIES/HORTICULTURAL AREAS',
                'OTHER AGRICULTURE',
                'PLANTATION',
                'FORMER AGRICULTURAL WETLAND (BECOMING SHRUBBY, NOT BUILT-UP)']
# Region dictionary
REGION_DICT = {'GRASSY': GRASSY,
                'DENSE_WOOD': DENSE_WOOD,
                'WOODY': WOODY,
                'SUBURBAN': SUBURBAN,
                'WATERY': WATERY,
                'URBAN': URBAN,
                'AGRICULTURAL': AGRICULTURAL
}

# Convert distance to degrees (approx)
LAT_BOUNDING_RADIUS_DEG = 69.0 # 69 miles per degree at 38 degrees North Latitude
LON_BOUNDING_RADIUS_DEG = 54.6 # 54.6 miles per degree at 38 degrees North Latitude for longitudinal directions


# Reference map from ArcGIS which utilizes the Land Use/Land Cover of New Jersey 2015 ArcGIS Layer from NJDEP Bureau of GIS 
# URL for Layer information: https://mapsdep.nj.gov/arcgis/rest/services/Features/Land_lu/MapServer/13
# Credit/Disclaimer: This map was developed using New Jersey Department of Environmental Protection Geographic Information System digital data, but this secondary product has not been verified by NJDEP and is not state-authorized or endorsed.
# Powered by Esri.
# Source: Esri, NASA, NGA, USGS, FEMA | New Jersey Office of GIS, Esri, HERE, Garmin, SafeGraph, GeoTechnologies, Inc, MÈTI/NASA, USGS, EPA, NPS, US Census Bureau, USDA | Ni Department of Environmental Protection (NJDEP), Division of Information Technology (DOIT), Bureau of Geographic Information System (BGiS)
# Web map ID for map utilizing the above layer: https://www.arcgis.com/home/search.html?restrict=false&sortField=relevance&sortOrder=desc&searchTerm=2705228b2b154d0a906ef7a54e533fac#content
WEBMAP_ID = "2705228b2b154d0a906ef7a54e533fac"

def get_layer(gis):
    '''
    Function to retrieve the Feature Layer (NJ Land Use/Land Cover). (Alternate - pass GIS after authentication earlier)
    
    Parameters:
    -----------
    gis - Authenticated access to ArcGIS Online


    Returns:
    --------
    layer - Feature Layer of the map (this has all the data/pointers for queries by lat/lon).
    
    '''

    # Access the webmap item by ID and get operational layers from the data
    webmap_item = gis.content.get(WEBMAP_ID)
    webmap_data = webmap_item.get_data()
    operational_layers = webmap_data["operationalLayers"]

    # URL of the operational layer
    layer_url = operational_layers[0].get('url')

    # Access the layer
    layer = FeatureLayer(layer_url)
    return layer


def get_area_of_interest(lat, lon, radius):
    '''
    Function to generate the area of interest Polygon based on image latitude and longitude.

    Parameters:
    -----------
    lat - Float. Latitude to center on.
    lon - Float. Longitude to center on.
    radius - Float. Fraction of a mile to use as side length for area of interest square.

    Returns:
    --------
    area_of_interest - arcgis Polygon. radius-sized-mile square centered at the location described by lat/lon values.
    
    '''
    # Define boundary square around the coordinates

    min_lat = lat - (radius/LAT_BOUNDING_RADIUS_DEG)
    max_lat = lat + (radius/LAT_BOUNDING_RADIUS_DEG)
    min_lon = lon - (radius/LON_BOUNDING_RADIUS_DEG)
    max_lon = lon + (radius/LON_BOUNDING_RADIUS_DEG)
    
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
    layer - ArcGIS map layer to query.
    aoi - Area of interest (box around image lat/lon). ArcGIS Polygon object.

    Returns:
    --------
    feature_areas - DataFrame with information for all feature labels and the area of their intersection with the area of interest (sq. meters).
    
    '''
    # Check spatial reference of AOI (WKID 4326)
    aoi_spatial_ref = aoi.spatial_reference['wkid']

    # Query the layer for features that intersect with the area of interest
    feature_set = layer.query(geometry_filter = filters.intersects(aoi))
    
    # Collect feature labels and their areas for all features in feature_set into DataFrame with Object_ID as unique identifier
    # Region_Label is the label provided by NJ ('Region' will be used to describe the region category (Grassy, Dense Wood, Woody, Suburban, Watery, Urban))
    # Acres is full acreage of the region
    # Intersect_Area is the area of the intersection of the region with the area of interest, measured in square meters
    feature_areas = pd.DataFrame(columns=['Region_Label', 'Region', 'Intersect_Area', 'Region_Intersect_Total']) 
    for feature in feature_set.features:
        feature_geometry = feature.geometry
        region_label = feature.attributes['LABEL15']
        feature_spatial_ref = feature_geometry['spatialReference']['wkid'] # WKID 102100, original WGS1984 Web Mercator projection
        
        # Get region category of the NJ Label:
        for region in REGION_DICT.keys():
            if region_label in REGION_DICT[region]:
                region_cat = region
                break
        
        # Match spatial refs
        feature_geometry = project(geometries = [feature_geometry],
                                    in_sr = feature_spatial_ref,
                                    out_sr = aoi_spatial_ref)[0]
        spatial_ref = aoi_spatial_ref # {'wkid': 4326}

        # Get intersection
        intersection = intersect(spatial_ref, 
                                 [aoi], 
                                 feature_geometry)
        # Get square meter area of intersetion
        area = areas_and_lengths(polygons = intersection[0], 
                                    length_unit = 9001, # meters
                                    area_unit = 9001, 
                                    calculation_type = 'preserveShape', 
                                    spatial_ref = spatial_ref)
        # Add row to DataFrame
        feature_areas.loc[len(feature_areas)] = {'Region_Label': region_label, 
                                                 'Region': region_cat,
                                                 'Intersect_Area': area['areas'][0],
                                                 'Region_Intersect_Total': 0}

    return feature_areas

def get_landcover_percentages(feature_areas):
    '''
    Function to determine percentage of area of interest covered by each land cover category (Grassy, Dense Wood, Woody, Suburban, Watery, Urban).
    
    Parameters:
    -----------
    layer - ArcGIS map layer to query.
    lat - Float. Latitude to center on.
    lon - Float. Longitude to center on.
    radius - Float. Fraction of a mile to use as side length for area of interest square.
    aoi - Area of interest. ArcGIS Polygon object.
    feature_areas - DataFrame containing regions and the area of their intersection with the given area of interest (lat/lon).

    Returns:
    --------
    region_percents - Dictionary of percentage of land in area of interest covered by each region category (index: Grassy, Dense Wood, Woody, Suburban, Watery, Urban).

    '''
    #aoi = get_area_of_interest(lat, lon, radius)
    #feature_areas = get_aoi_feature_areas(layer, aoi)
    total_area = 0
    region_percents = {'GRASSY': 0,
                    'DENSE_WOOD': 0,
                    'WOODY': 0,
                    'SUBURBAN': 0,
                    'WATERY': 0,
                    'URBAN': 0,
                    'AGRICULTURAL': 0
    }
    # Get total area of each region (Grassy, Dense Wood, Woody, Suburban, Watery, Urban) and sum total area
    for region in feature_areas.Region.unique():
        region_sum = feature_areas.loc[feature_areas.Region == region, 'Intersect_Area'].sum()
        feature_areas.loc[feature_areas.Region == region, 'Region_Intersect_Total'] = region_sum
        total_area = total_area + region_sum
    
    # Collect percentage of each region type 
    if total_area != 0:
        for region in feature_areas.Region.unique():
            region_sum = feature_areas.loc[feature_areas.Region == region, 'Region_Intersect_Total'].values[0]
            region_percents[region] = region_sum/total_area

    return region_percents
