# cog-insights
# Interactive COG Map Viewer

## Description
The Interactive COG Map Viewer is a web-based tool designed for visualizing and analyzing Cloud-Optimized GeoTIFF (COG) data. This library integrates geospatial data visualization with interactive mapping features, allowing users to dynamically adjust settings like transparency, scale domain, and color scale for GeoTIFF layers. It also includes functionalities like location search, data comparison, and marker management. The tool has been built using plain JavaScript, CSS, and HTML.

## Features
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
- **Load GeoTIFF Data:** Enter the URL of a Cloud-Optimized GeoTIFF or use the provided sample data.
- **Adjust Settings:** Customize the visualization by adjusting opacity, pixel/no data intervals and color scales.
- **Add Markers:** Click on the map, find your location or search an address to add markers and analyze specific data points.
- **Data Comparison:** Use the scatter chart for comparing data at different locations.

For a detailed showcase of the Interactive COG Map Viewer, you can watch tutorial video by clicking the image below.

[![Custom Image](https://github.com/sanozmen/cog-insights/assets/9783642/31c487f1-7efb-47d9-82a1-a3d65eac59c1)](https://www.youtube.com/watch?v=xfNV8AmWASY)

## Contributing
Contributions are welcome. Please read the contribution guidelines before submitting pull requests.

## License
This project is licensed under the MIT License

## Acknowledgments
Special thanks to the contributors of Leaflet, GeoRaster, Chroma.js, Chart.js, and other libraries that made this tool possible.



