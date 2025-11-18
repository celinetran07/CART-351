#This is an import statement to include the request library
import requests
#This is my API token 
token = "97fa1e707f49a67df83f2ba7676f42338294d42a"
#This is the URL for the API
url = "https://api.waqi.info/search/"  
#This line sends a GET request to the API with the specified parameters
response = requests.get(url, params={"token": token, "keyword": "montreal"}) 
#This line gets the json response and stores it in the variable results
results = response.json()
#This line prints the results to the console
print(results)

#This line gets the type of the results variable
print(type(results))
#The printed result is: <class 'dict'>

#This line prints the keys of the results variable
print(results.keys())
#The printed result is: dict_keys(['status', 'data'])

#This line accesses the content associated with the data field and saves the result in the variable responseData
responseData = results["data"]

#prints the type of the responseData variable
print(type(responseData))
#the result: <class 'list'>


#This for loop prints each item in the responseData list, which contains information about air quality stations in Montreal.

#Example Output: {'uid': 5922, 'aqi': '24', 'time': {'tz': '-04:00', 'stime': '2025-09-22 14:00:00', 'vtime': 1758564000}, 'station': {'name': 'Montreal', 'geo': [45.5086699, -73.5539925], 'url': 'montreal'}}

#Each item is a dictionary with details such as station name, location, and air quality index.
for item in responseData:
    print(item)

#This prints the type of the first item in the responseData list
print(type(responseData[0]))

#This code determines the keys associated with the first item in the responseData list
print(responseData[0].keys())

#Modify the code above to now print out the name of each station from the responseData
for item in responseData:
    print("station",item['station']['name'])  
#This prints the following output:
# station Montreal
# station Échangeur Décarie, Montreal, Canada
# ...

#This line appends the above code to print the geolocations of each stations from the responseData list
print("The geolocations of each station are:")

for item in responseData:
    print("lat:", item['station']['geo'][0])
    print("long:", item['station']['geo'][1])

#My output looks like this: lat: 45.468297
#long: -73.741185
#lat: 45.426509
#long: -73.928944

#Append the code above to print out the air quality index for each item AND the uid for each item. The output needs to be neat and labelled!
print("The air quality index and uid for each station are:")
for item in responseData:
    print("uid:", item['uid'])
    print("air quality index:", item['aqi'])
#My output looks like this: uid:
#uid: 5922
#air quality index: 24

#url to get the data for a specific station.
url_feed = "https://api.waqi.info/feed/@5468"
#make get request with parameters to get montreal data
response_feed = requests.get(url_feed, params={"token": token})
#get request as a json
results_feed = response_feed.json()
print(results_feed)

#{'status': 'ok', 'data': {'aqi': 30, 'idx': 5468, 'attributions': [{'url': 'http://ville.montreal.qc.ca/portal/page?_pageid=7237,74495616&_dad=portal&_schema=PORTAL', 'name': "Ville de Montreal - Réseau de surveillance de la qualité de l'air", 'logo': 'Canada-Montreal.png'}, {'url': 'https://waqi.info/', 'name': 'World Air Quality Index Project'}, 'max': 45, 'min': 28}, {'avg': 46, 'day': '2025-09-23', 'max': 53, 'min': 38}, {'avg': 30, 'day': '2025-09-24', 'max': 54, 'min': 22}, {'avg': 22, 'day': '2025-09-25', 'max': 28, 'min': 12}, {'avg': 21, 'day': '2025-09-26', 'max': 34, 'min': 9}, {'avg': 42, 'day': '2025-09-27', 'max': 47, 'min': 29}], 'uvi': [{'avg': 0, 'day': '2025-09-21', 'max': 0, 'min': 0}, {'avg': 0, 'day': '2025-09-22', 'max': 4, 'min': 0}, {'avg': 0, 'day': '2025-09-23', 'max': 2, 'min': 0}, {'avg': 1, 'day': '2025-09-24', 'max': 5, 'min': 0}, {'avg': 0, 'day': '2025-09-25', 'max': 2, 'min': 0}, {'avg': 0, 'day': '2025-09-26', 'max': 3, 'min': 0}]}}, 'debug': {'sync': '2025-09-23T04:53:02+09:00'}}}

#write the code to access the content associated with the data field. Save the result from the expression as a variable called response_data_feed. 
print("Accessing the data field from the feed results:")
response_data_feed = results_feed['data']
print(type(response_data_feed))
#What id the type of this variable? <class 'dict'>

#Write a for loop to iterate through the `response_data_feed` variable
for key in response_data_feed.keys():
    print(f"{key}: {response_data_feed[key]}")

#aqi: 30
#idx: 5468
#attributions: [{'url': 'http://ville.montreal.qc.ca/portal/page?_pageid=7237,74495616&_dad=portal&_schema=PORTAL', 'name': "Ville de Montreal - Réseau de surveillance de la qualité de l'air", 'logo': 'Canada-Montreal.png'}, {'url': 'https://waqi.info/', 'name': 'World Air Quality Index Project'}]
#city: {'geo': [45.426509, -73.928944], 'name': 'Sainte-Anne-de-Bellevue, Montreal, Canada', 'url': 'https://aqicn.org/city/canada/montreal/sainte-anne-de-bellevue', 'location': ''}
#dominentpol: pm25
#iaqi: {'co': {'v': 6.4}, 'h': {'v': 75.1}, 'no2': {'v': 7.4}, 'o3': {'v': 22}, 'p': {'v': 1013.6}, 'pm25': {'v': 30}, 'so2': {'v': 5.1}, 't': {'v': 19.1}, 'w': {'v': 1}, 'wg': {'v': 1.3}}
#time: {'s': '2025-09-22 14:00:00', 'tz': '-04:00', 'v': 1758549600, 'iso': '2025-09-22T14:00:00-04:00'}
#forecast: {'daily': {'pm10': [{'avg': 6, 'day': '2025-09-20', 'max': 6, 'min': 5}, {'avg': 11, 'day': '2025-09-21', 'max': 17, 'min': 6}, {'avg': 11, 'day': '2025-09-22', 'max': 13, 'min': 9}, {'avg': 12, 'day': '2025-09-23', 'max': 15, 'min': 9}, {'avg': 9, 'day': '2025-09-24', 'max': 17, 'min': 7}, {'avg': 6, 'day': '2025-09-25', 'max': 9, 'min': 4}, {'avg': 6, 'day': '2025-09-26', 'max': 9, 'min': 3}, {'avg': 11, 'day': '2025-09-27', 'max': 12, 'min': 8}], 'pm25': [{'avg': 13, 'day': '2025-09-20', 'max': 13, 'min': 12}, {'avg': 36, 'day': '2025-09-21', 'max': 53, 'min': 13}, {'avg': 34, 'day': '2025-09-22', 'max': 45, 'min': 28}, {'avg': 46, 'day': '2025-09-23', 'max': 53, 'min': 38}, {'avg': 30, 'day': '2025-09-24', 'max': 54, 'min': 22}, {'avg': 22, 'day': '2025-09-25', 'max': 28, 'min': 12}, {'avg': 21, 'day': '2025-09-26', 'max': 34, 'min': 9}, {'avg': 42, 'day': '2025-09-27', 'max': 47, 'min': 29}], 'uvi': [{'avg': 0, 'day': '2025-09-21', 'max': 0, 'min': 0}, {'avg': 0, 'day': '2025-09-22', 'max': 4, 'min': 0}, {'avg': 0, 'day': '2025-09-23', 'max': 2, 'min': 0}, {'avg': 1, 'day': '2025-09-24', 'max': 5, 'min': 0}, {'avg': 0, 'day': '2025-09-25', 'max': 2, 'min': 0}, {'avg': 0, 'day': '2025-09-26', 'max': 3, 'min': 0}]}}
#debug: {'sync': '2025-09-23T04:53:02+09:00'}

#write the expression to access the aqi field and the dominentpolfield - according to the documentation what does this field represent? Save both values in new variables.
aqi_value = response_data_feed['aqi']
dominentpol_value = response_data_feed['dominentpol']
print(f"AQI: {aqi_value}, Dominent Pollutant: {dominentpol_value}")
#The dominentpol field represents the primary pollutant of the air quality index (AQI) at a given location.
#Output result -> AQI: 30, Dominent Pollutant: pm25

#you will access the iaqi field. You will see that the result is another dictionary, with keys for different pollutants. Each one of those keys—somewhat inexplicably—has another dictionary for its values, whose only key (`v`) points to the actual value for that pollutant.
iaqi_value = response_data_feed['iaqi']
print(type(iaqi_value))
#the result is a dictionary: <class 'dict'>

#we want to use the value from the dominentpol field to access the actual value for that pollutant... (i.e. say the `dominentpol =so2') - how can we use the data from the iaqi field to access the actual value?
actual_value = iaqi_value[dominentpol_value]['v']
print(f"Actual value for {dominentpol_value}: {actual_value}")
#the output -> Actual value for pm25: 30

#explain theoretically (you do not have to write the code) what the process would be to access the value of the dominant pollutant value from different cities 
#To access the value of the dominant pollutant from different cities, we would have to first make separate API requests for each city to retrieve their respective air quality data. We would then extract the 'dominentpol' value for each city and use it to look up the corresponding pollutant value in the 'iaqi' dictionary, just as we did for Montreal. This process would be repeated for each of the cities that we want to extract.

