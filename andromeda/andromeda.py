# Andromeda Dimensionality Functions

import pandas as pd
import numpy as np
import random

#import required sklearn packages:
from sklearn.decomposition import PCA
from sklearn.manifold import MDS
from sklearn.metrics.pairwise import manhattan_distances, euclidean_distances


def normalized_df(df):
    '''
    Normalize dataframe to use with dimension_reduction or inverse_DR (dataHD inputs).

    @parameters:
        pd.df: original high-dimensional data
    @return[dataframe]: Dataframe with non numeric columns removed and numeric data normalized
    '''
    df.set_index('Image_Label', inplace = True)

    label_names = df.index.tolist()
    image_paths = {}
    for name in label_names:
        image_paths[name] = df['Image_Link'][name]

    df = df.loc[:, ~df.columns.isin(['Image_Link','Species','User','Date','Time','Annotations','Hex_Color_Code'])]
    df_numeric = df.select_dtypes(include='number')  #'int32' or 'int64' or 'float32' or 'float64'
    df_numeric = df_numeric.loc[:, (df_numeric != df_numeric.iloc[0]).any()] 
    normalized_df = (df_numeric - df_numeric.mean()) / df_numeric.std()

    return normalized_df

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


##Updating Weights, based on manual re-organization of images in the plot


def new_proposal(current, step, direction):
    '''
    Helper function to generate new proposed weight between 0 and 1.
    '''
    return np.clip(current + direction*step*random.random(), 0.00001, 0.9999)

def inverse_DR(dataHD, data2D, curWeights = None): 
    '''

    Generates new weights based on manual movements of the images in the plot.

    Parameters:
    -----------
    dataHD - DataFrame or Array of high-dimensional data
    data2D - DataFrame or Array of projected 2D data
    curWeights - Weights for features (columns of dataHD). list? Default value is None. 

    Returns:
    --------
    Series of new weights

    '''
    """
    ......
    @parameters:
        dataHD[pd.df or np.array]: high-dimensional data
        data2D[pd.df or np.array]: projected 2D data
    @return[pd.Series]: new weights  
    """
    print("data2D.1", data2D);
    dist2D = distance_matrix_2D(data2D)  # compute 2D distances only once
    print("dist2D.2", dist2D);
    col_names = dataHD.columns
    dataHD = dataHD.to_numpy()  # use numpy for efficiency 
    row, col = dataHD.shape
    
    if curWeights == None:
        curWeights = np.array([1.0/col]*col)  # default weights = 1/dim, dim = num cols
    else:
        curWeights = curWeights.to_numpy()
        curWeights = curWeights / curWeights.sum()  # Normalize weights to sum to 1
    newWeights = curWeights.copy()  # re-use this array for efficiency 
        #defining this way to confirm size/shape is the same for true_divide output later
    
    # Initialize state
    flag = [0]*col         # degree of success of a weight change
    direction = [1]*col  # direction to move a weight, pos or neg
    step = [1.0/col]*col   # how much to change each weight
    print("cw", curWeights);
    dataHDw = dataHD * curWeights   # weighted space, re-use this array                              
    distHD = distance_matrix_HD(dataHDw)
    print("distHD", distHD);
    curStress = stress(distHD, dist2D)
    print('Starting stress =', curStress, 'Processing...')   

    MAX = 500   # default setting of the number of iterations

    # Try to minorly adjust each weight to see if it reduces stress
    for i in range(MAX):
        for dim in range(col):            
            # Get a new weight for current column
            nw = new_proposal(curWeights[dim], step[dim], direction[dim])
            
            # Scale the weight list such that it sums to 1
            s = 1.0  + nw - curWeights[dim]   # 1.0 == curWeights.sum()
            '''
            curWeights is being used instead of newWeights because
            they are equal to each other until this next step in the first iteration, but then not
            done to instantiate newWeights to proper size/shape first for this to work
            '''
            np.true_divide(curWeights, s, out = newWeights)  # transfers to other array, while doing /
            newWeights[dim] = nw/s
            
            # Apply new weights to HD data
            np.multiply(dataHD, newWeights, out = dataHDw)  # dataHDw = dataHD * newWeights; reuses dataHDw array
            distHD = distance_matrix_HD(dataHDw)

            # Get the new stress
            newStress = stress(distHD, dist2D)
            
            # If new stress is lower, then update weights and flag this success
            if newStress < curStress:
                temp = curWeights
                curWeights = newWeights
                newWeights = temp   # reuse the old array next iteration
                curStress = newStress
                flag[dim] = flag[dim] + 1
            else:
                flag[dim] = flag[dim] - 1
                direction[dim] = -direction[dim]  # Reverse course
    
            # If recent success, then speed up the step rate
            if flag[dim] >= 5:
                step[dim] = step[dim] * 2
                flag[dim] = 0
            elif flag[dim] <= -5:
                step[dim] = step[dim] / 2
                flag[dim] = 0
                
    print('Solution stress =', curStress, 'Done.')  
    return pd.Series(curWeights, index=col_names, name="Weight")