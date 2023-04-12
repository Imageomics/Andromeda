#Draggable Points Class


class DraggablePoints(object):
    def __init__(self, ax, artists):
        self.ax = ax
        self.artists = artists
        self.current_artist = None
        self.last_selected = None
        ax.selected_text.set_text('Selected: none')
        self.offset = (0, 0)
        # Set up mouse listeners
        ax.figure.canvas.mpl_connect('pick_event', self.on_pick)
        ax.figure.canvas.mpl_connect('motion_notify_event', self.on_motion)
        ax.figure.canvas.mpl_connect('button_release_event', self.on_release)

    def on_pick(self, event):
        '''
        Function to recognize a click and initiate drag
        
        Parameters:
        -----------
        event -
        '''
        # When point is clicked on (mouse down), select it and start the drag
        if self.current_artist is None:  # clicking on overlapped points sends multiple events
            self.last_selected = event.artist.index  # event.ind
            self.current_artist = event.artist
            event.artist.selected = True
            event.artist.savecolor = event.artist.get_facecolor()
            event.artist.set_facecolor('green')
            #event.artist.set_alpha(1.0)
            self.ax.selected_text.set_text("Selected: " + event.artist.label)
            x0, y0 = event.artist.center
            self.offset = (x0 - event.mouseevent.xdata), (y0 - event.mouseevent.ydata)

    def on_motion(self, event):
        '''
        Function to check if a point is point is selected and mouse coordinates are valid for drag, then implement drag.
        
        Parameters:
        -----------
        event - 
        
        '''
        # When dragging, check if point is selected and valid mouse coordinates
        if (self.current_artist is not None) and (event.xdata is not None) and (event.ydata is not None):
            # Drag the point and its text label
            dx, dy = self.offset
            x0, y0 = event.xdata + dx, event.ydata + dy
            self.current_artist.center = x0, y0 #= event.xdata + dx, event.ydata + dy
            self.current_artist.text.set_position((x0 + self.current_artist.radius, 
                                                   y0 ))
            if self.current_artist.ab:
                self.current_artist.ab.xybox = (x0,y0)
        
    def on_release(self):
        ''' 
        Function to stop dragging the point when the mouse is released
        '''
        self.ax.figure.canvas.draw()
        self.current_artist = None
        