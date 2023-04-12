#Dimensionality Reduction Functions

import pandas as pd
#import required sklearn packages:
from sklearn.decomposition import PCA
from sklearn.manifold import MDS
from sklearn.metrics.pairwise import manhattan_distances, euclidean_distances

def distance_matrix_HD(dataHDw):  
    """
    Compute the distance matrix for the weighted high-dimensional data using L1 distance function.
    Input HD data should already be weighted.
    
    @parameters:
        dataHDw[pd.df or np.array]: weighted high-dimensional data
    @return[array]: distance matrix for input weighted high-dimensional data
    """
    dist_matrix = manhattan_distances(dataHDw)
    return dist_matrix

def distance_matrix_2D(data2D): 
    """
    Compute the distance matrix for 2D projected data using L2 distance function.
    
    @parameters: 
        data2D[pd.df or np.array]: projected 2D data
    @return[np.array]: distance matrix for 2D input data
    """
    dist_matrix = euclidean_distances(data2D) 
    return dist_matrix


def stress(distHD, dist2D): 
    """
    Calculate the MDS stress metric between HD and 2D distances.
    @parameters: 
        distHD[np.array]: distance matrix for high-dimensional data
        dist2D[np.array]: distance matrix for 2D data
    @return[float]: stress value
    """
    s = ((distHD-dist2D)**2).sum() / (distHD**2).sum()   # numpy, eliminate sqrt for efficiency
    '''why? & numpy not used...'''
    return s

def compute_mds(dataHDw):  
    """
    apply MDS to high-dimensional data to get 2D data
    @parameters:
        dataHDw[pd.df or np.array]: weighted high-dimensional data
    @return[dataframe]: a dataframe of 2D data 
    """
    distHD = distance_matrix_HD(dataHDw)
    ### Adjust these parameters for performance/accuracy tradeoff
    '''is there an ability to do so? 
    Or is this the optimized performance/accuracy tradeoff occuring?'''
    mds = MDS(n_components=2, dissimilarity='precomputed', n_init=10, max_iter=1000, random_state=3)
    # Reduction algorithm happens here:  data2D is n*2 matrix
    data2D = mds.fit_transform(distHD)
    
    ### Rotate the resulting 2D projection to make it more consistent across multiple runs.
    ### Set the 1st PC to the y axis, plot looks better to spread data vertically with horizontal text labels
    pca = PCA(n_components=2)
    data2D = pca.fit_transform(data2D)
    data2D = pd.DataFrame(data2D, columns=['y','x'], index=dataHDw.index)
    
    data2D.stress_value = stress(distHD, distance_matrix_2D(data2D))
    return data2D

def dimension_reduction(dataHD, wts): # dataHD, wts -> data2D (pandas)
    """
    apply weights to high-dimensional data then apply MDS to get 2D data
    @parameters:
        dataHD[pd.df or np.array]: original high-dimensional data
    @return[dataframe]: a dataframe of projected 2D data
    """
    ### Normalize the weights to sum to 1
    wts = wts/wts.sum()
    
    ### Apply weights to the HD data 
    dataHDw = dataHD * wts
    
    ### DR algorithm
    data2D = compute_mds(dataHDw)

    ### Compute row relevances as:  data dot weights
    ### High relevance means large values in upweighted dimensions
#     data2D['relevance'] = dataHDw.sum(axis=1)
    return data2D

