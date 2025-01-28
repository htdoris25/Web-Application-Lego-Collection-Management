# Lego Collection Web Application
The Digital Lego Library is a web application designed to provide a comprehensive platform for managing and exploring Lego collections. Users can add, edit, and delete Lego sets, view detailed information about each set, filter sets by theme, and track their login history. This application serves as a centralized digital database, empowering Lego enthusiasts to organize and interact with their collections effectively.
<img width="1308" alt="Mainpage" src="https://github.com/user-attachments/assets/159961d0-8121-4a8c-a388-999fc22622eb" />


## Dual Database Integration
The application leverages a dual-database architecture for optimized data management and scalability:

<strong> MongoDB</strong> : A NoSQL database used to store user-related data, including usernames, passwords, and login history. Its flexible schema allows easy modification and expansion to accommodate evolving user needs.  
<strong>PostgreSQL</strong>: A relational database designed to store structured Lego set information. It supports complex queries, making it ideal for organizing and retrieving detailed Lego set data.
By utilizing both databases, the application ensures efficient data handling, with each database serving its specific purpose for streamlined operations and scalability.


## Functionality
- **sets.ejs:**  
Displays a collection of Lego sets, allowing users to browse and view their detail information. Filtering options by theme are available to help users refine their search.
  <img width="1317" alt="CollectionList" src="https://github.com/user-attachments/assets/4b38f2a1-b364-4976-b0e6-235b9bc1d805" />

- **editSet.ejs:**  
This view enables logged-in users to edit existing Lego sets by providing an "Edit" button. Through the provided form, users can update details for the Lego set/
  <img width="1312" alt="Edit" src="https://github.com/user-attachments/assets/fb2d5a3d-4ae4-49b0-9a14-25b005a6c5d9" />


