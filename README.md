# cog-insights
# Interactive COG Map Viewer

## Description
The Interactive COG Map Viewer is a web-based tool designed for visualizing and analyzing Cloud-Optimized GeoTIFF (COG) data. This library integrates geospatial data visualization with interactive mapping features, allowing users to dynamically adjust settings like transparency, scale domain, and color scale for GeoTIFF layers. It also includes functionalities like location search, data comparison, and marker management. The tool has been built using plain JavaScript, CSS, and HTML.

[**DEMO**](https://sanozmen.github.io/cog-insights/cog-insights.html)


## Main Features
- **Dynamic GeoTIFF Visualization:** Load and display COG data on interactive maps.
- **Pixel Value and 'No Data' Interval Settings:** Define specific pixel value ranges and handle intervals for 'no data' values.
- **Adjustable Map/Legend Settings:** Customize opacity and color scales.
- **Real-Time Pixel Value Display:** View pixel values in an info box at the top right corner while hovering over the map.
- **Interactive Data Analysis:** Analyze data with an integrated scatter chart.
- **Location Search and Geocoding:** Find and center on specific locations.
- **Marker Management:** Add, remove, or compare markers with COG data values. 
- **Responsive Design:** Crafted with a responsive layout for various devices (not perfect in mobile yet though).

## Installation and Setup
1. **Clone the Repository:** `git clone [repository-url]`
2. **Navigate to the Directory:** `cd [repository-name]`
3. **Open `index.html`:** Launch the file in a web browser.

## Usage

- **Viewing GeoTIFF Data:** Hover over the map to view values at different locations.
  
- **Adding Markers:** Click on the map to add markers. The markers will display the GeoTIFF data value at the clicked location. Marker numbers are displayed next to each marker.
- **Comparing Data:** Click "Add to Comparison" on a marker's popup to add that marker's data to the comparison graph.
- **Finding Your Location:** Click the "Find Me" button at the top left to center the map on your location and add a marker at your location.
- **Searching for Locations:** Use the search bar at the top left to search for locations. A marker will be added at the searched location.
- **Removing Individual Markers:** Right-click the marker to remove it from the map and graph. If on mobile, long press nearby the marker.
- **Clearing Markers:** Click the "Clear All Markers" button at the top left to remove all markers from the map and clear the comparison graph.
- **Adjusting Opacity:** Use the opacity slider at the top left to adjust the opacity of the GeoTIFF layer.
- **Customizing Data Visualization:** Adjust the minimum and maximum pixel values to refine the data visualization according to specific thresholds. This can help in focusing on areas of interest within the GeoTIFF data.
- **Setting No Data:** Set minimum and maximum values to define the range for transparent pixels.
- **Choosing Color Scales:** Select a color scale from the dropdown in the 'Color Scale Selection' section to change the color theme of the GeoTIFF visualization. Different color scales can be used to highlight various aspects of the data.
- **Applying Custom Settings:** After adjusting settings such as scale domain, transparency, and color scale, click the 'Apply' button to update the map with these new settings.
- **Loading Custom GeoTIFF:** Enter the URL of a Cloud-Optimized GeoTIFF (COG) in the 'COG URL' input field and press 'Load COG' to view a different GeoTIFF on the map.
- **Viewing Data Legends:** Refer to the legend at the bottom left of the map for understanding the GeoTIFF data value color coding.
   **Interactive Data Analysis:** Use the scatter chart in the side pane to analyze the relationship between different markers added to the comparison list. The chart dynamically updates as you add or remove markers from the comparison.
- **Expanding and Collapsing Side Pane:** Use the toggle button at the edge of the side pane to expand or collapse the pane for a better view of the map and chart.

For a detailed showcase of the Interactive COG Map Viewer, you can watch tutorial video by clicking the image below.

[![Custom Image](https://github.com/sanozmen/cog-insights/assets/9783642/31c487f1-7efb-47d9-82a1-a3d65eac59c1)](https://www.youtube.com/watch?v=xfNV8AmWASY)

## Contributing
Contributions are welcome. 

## License
This project is licensed under the MIT License

## Acknowledgments
Special thanks to the contributors of Leaflet, GeoRaster, Chroma.js, Chart.js, and other libraries that made this project possible.



