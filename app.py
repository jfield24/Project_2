from flask import Flask, render_template, redirect, Response, url_for, request, jsonify, session
from flask_pymongo import PyMongo
import run_api
import json
import requests
from config import api_key
import pandas as pd
import time
from datetime import datetime, date
from dateutil.relativedelta import relativedelta, MO
import sqlite3
from pymongo import MongoClient

# Create an instance of Flask
app = Flask(__name__)

# Use PyMongo to establish Mongo connection
#mongo = PyMongo(app, uri="mongodb://localhost:27017/stock_app1")

client = MongoClient("mongodb+srv://project2_:project2@cluster0.rmvtp.mongodb.net/stock_app1?retryWrites=true&w=majority")


# Load SQLite database for dropdown menu rendering
con = sqlite3.connect('data.sqlite')
df = pd.read_sql('SELECT * FROM stocks_table', con)

# Route to render index.html template using data from Mongo
@app.route("/", methods=['POST', 'GET'])
def home():

    # Find one record of data from the mongo database
    stock_a = client.get_database('stock_app1')
    x = stock_a.stock.find({},{'_id': False})

    stock = []
    for i in x: 
        stock.append(i)
    print(stock)
    

    # Return template and data
    return render_template("index.html",stock=stock[0], ddd=df['ticker'].to_list())


# # Route that will trigger the scrape function
@app.route("/api")
def api():
    
    stock = mongo.db.stock
    stock_data = run_api.run_info()
    stock.update({}, stock_data, upsert=True)
    #return "API successful!"
    return redirect("/")

### We were unable here to connect the selection to rest of the code (even with the global select variable)
@app.route("/select", methods=['POST', 'GET'])
def select():
    if request.method == "POST":
        text = request.select.get('stocktick')
        return jsonify(text)

@app.route("/data")
def data():

    articles_df = pd.read_csv('articles.csv')
    company = "Apple Inc"
    # Search for articles that mention company name
    query = company

    articles_df["Articles"] = ''
    for index, row in articles_df.iterrows():
        try:
            query = company
            date = datetime.strptime(row['Date'], '%d/%m/%Y').date()
            begin_date = date.strftime('%Y%m%d')
            end_date = (date + relativedelta(years=+1)).strftime('%Y%m%d')
            url = f"https://api.nytimes.com/svc/search/v2/articlesearch.json?api-key={api_key}&q={query}&begin_date={begin_date}&end_date={end_date}"
            #print(url)
            article = requests.get(url).json()
            time.sleep(2)
            articles_df.loc[index, "Articles"] = article['response']['meta']['hits']
            
        except KeyError:
            articles_df.loc[index, "Articles"] = 0

        article_list = []
    for x in range(len(articles_df["Date"])):
        d = articles_df["Date"]
        a = articles_df["Articles"]
        article_list.append({"Date":d[x], 'Articles': a[x]})
    
    

    return json.dumps(article_list)


if __name__ == "__main__":
    app.run(debug=True)
