from flask import Flask,render_template,request
import os
app = Flask(__name__)


# the default route
@app.route("/")
def index():
      return render_template("index.html")

#*************************************************

#Task: Variables and JinJa Templates
@app.route("/t1")
def t1():
    the_topic = "Donuts"
    number_of_donuts = 28
    special_items = True # Boolean variable for jinja conditional
    donut_data = {
        "flavours": ["Regular", "Chocolate", "Blueberry", "Devil's Food"],
        "toppings": ["None", "Glazed", "Sugar", "Powdered Sugar",
                    "Chocolate with Sprinkles", "Chocolate", "Maple"]
    }
    icecream_flavors = ["Vanilla", "Raspberry", "Cherry", "Lemon"]
    return render_template("t1.html", 
                         the_topic=the_topic,
                         number_of_donuts=number_of_donuts,
                         donut_data=donut_data,
                         icecream_flavors=icecream_flavors,
                         special_items=special_items) # Boolean variable for jinja conditional

#*************************************************

#Task: HTML Form get & Data
@app.route("/t2")
def t2():
    return render_template("t2.html")

# 4. Using the GET method pass the inputted data from the HTML form to the specified function via the '/thank_you_t2'route *** (remember to also set the action attribute in the form smile)
# 5. Within this receiver function alter the data such that all three data points are combined into one long string - and within this string replace each vowel with an asterisk.
# 6. Pass this modified string to the associated template and output the text to the page creatively.
@app.route("/thank_you_t2")
def thank_you_t2():
    # Get form data
    name = request.args.get('name')
    email = request.args.get('email')
    message = request.args.get('message')
    # Combine all data into one string
    combined_string = f"{name} | {email} | {message}"
    # Replace vowels with asterisks
    vowels = 'aeiouAEIOU'
    modified_string = ""
    for char in combined_string:
        if char in vowels:
            modified_string += '*'
        else:
            modified_string += char
    return render_template("thankyou_t2.html", modified_text=modified_string)

#*************************************************
#run
app.run(debug=True)