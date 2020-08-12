######################################################################################################################################################################################################################
#																										J I K I K I
######################################################################################################################################################################################################################
# Author: Meisam Koohaki -200412272
# Professor: J. D. Ameral
# Georgian College
# Summer, 2020

# Jikiki is a web application which is created in Visual Studio by using full-stack JavaScript solution
# This applicatoin comprises three major building blocks of 4 possible layers:
#   - MongoDB as the database
#   - Express as the web server framework
#   - Node.js as the server platform
# This application can use for putting items for sale, but in this level all users can access to edit/delete whole items.
# User put the address "...." (it comes after make it live) in the browser, the splash page comes up.
# User has four options: 
#           If user already has username and password, he/she can put in the form and directly goes to the personal page
#           If user has username and password but it is forgotten, then he/she can go to retrieve page.
#           If user wants to see the eavailable items can clisk the link ang will go to the home page, which is read-only.
#           If user wants, he/she can gor to sign up page. There is an option to sign up with Google account too.
# When user goes to personal page which is private, he/she can add an item to the list. It needs at least fillingout three fields 'Item name', 'Description', and 'price' and the 'Image' field is optional.
# After clicking the 'Submit' button, information will save in database on MongoDB and the page will refresh and display all items includ the new one. If user want, he/she will able to edit the items or delete them.
# In the table in front of each item will be a 'Edit' and 'Delete' links. the 'Edit' linke brings user to the edit page.
# When user push log out button(which available in all pages) he/she completely log out from the application and no way to come back even put the address in the browser, application brings up the home page.
# In this application I do not use CSS or JS from others and all things are my work.
#######################################################################################################################################################################################################################