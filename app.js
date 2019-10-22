'use strict';

require('dotenv').config();

const express = require('express');
const mongoClient = require('mongodb').MongoClient;

const app = express();
const mongoUri = process.env.DB_DRIVER + '://' + process.env.DB_HOST + ':' + process.env.DB_PORT;

const movieToFind = 'Rambo 4';
const moviesToAddField = ['Gladiator', 'X-Men'];
const hitArray = ['Super Hit', 'Super duper Hit'];
const movies = [
    {
        'name': 'Gladiator',
        'genre': 'Action',
        'rating': 9,
        'language': 'English'
    }, {
        'name': 'Memento',
        'genre': 'Mystery',
        'rating': 7,
        'language': 'English'
    }, {
        'name': 'X-Men',
        'genre': 'Action',
        'rating': 8,
        'language': 'English'
    }, {
        'name': 'American Psycho',
        'genre': 'Crime',
        'rating': 7,
        'language': 'English'
    }, {
        'name': 'Rambo 4',
        'genre': 'Action',
        'rating': 8,
        'language': 'English'
    }];

// MongoDB connection
mongoClient.connect(mongoUri,
    {
        "useUnifiedTopology": true,
        "useNewUrlParser": true
    })
    .then(db => {
        app.listen(process.env.APP_PORT, () => {
            console.log(`DB is up and running`);
            console.log(`App-Server is running on port --> ${process.env.APP_PORT}`);
            
            const moviesDB = db.db('movies');   // Create 'movies' database
            
            // 1. Add 5 movies to 'movies' collection
            console.log(`\n|---> 1. Add 5 movies to 'movies' collection`);
            // Create 'movies' collection
            movies.forEach(movie => {
                // Insert all movies in 'movies' array, and avoid duplicates by name validation
                moviesDB.collection('movies')
                    .updateOne(
                        { name: movie.name },
                        { $set: movie },
                        { upsert: true });
            });
    
            // 2. Query that returns all the movies
            moviesDB.collection('movies')
                .find({})
                .toArray()
                .then(data => {
                    console.log(`\n|---> 2. Query that returns all the movies`);
                    data.forEach((movie, index) => {
                        console.log(`MOVIE ${index+1}: ${JSON.stringify(movie)}`);
                    });
                })
                .catch(error => {
                    console.log(`\n|---> 2. Query that returns all the movies`);
                    console.log(`None movie could be retrieved from 'movies' collection`);
                    throw error;
                });
            // 3. Query to find a movie name using findOne method
            moviesDB.collection('movies')
                .findOne({ name: movieToFind })
                .then(movie => {
                    console.log(`\n|---> 3. Query that find a movie name using findOne method`);
                    console.log(`The movie ${movieToFind} has been found successfully`);
                    console.log(`${JSON.stringify(movie)}`);
                })
                .catch(error => {
                    console.log(`\n|---> 3. Query that find a movie name using findOne method`);
                    console.log(`The movie ${movieToFind} could not be found in DB`);
                    throw error;
                });
            
            // 4. Query that returns the three highest rated movies
            moviesDB.collection('movies')
                .find({})
                .sort({rating: -1})
                .limit(3)
                .toArray()
                .then(data => {
                    console.log(`\n|---> 4. Query that return the 3 highest rated movies`);
                    data.forEach((movie, index) => {
                        console.log(`${index+1}. ${JSON.stringify(movie)}`);
                    });
                })
                .catch(error => {
                    console.log(`\n|---> 4. Query that return the 3 highest rated movies`);
                    console.log(`No movies to be rated`);
                    throw error;
                });
            
            // 5. Add a key called achievements in any two documents.
            //    One document should have 'super hit' and other should have
            //    'Super Duper Hit' as value to key achievements.
            // 5.1. Use update() method
            moviesDB.collection('movies')
                .updateOne(
                    { name: moviesToAddField[0] },
                    { $set: { 'achievements': hitArray[0]} },
                    { upsert: true })
                .then(() => {
                    console.log(`\n|---> 5.1. Add a key called achievements to ${moviesToAddField[0]}, with update method`);
                })
                .catch(error => {
                    console.log(`\n|---> 5.1. Add a key called achievements to ${moviesToAddField[0]}, with update method, could not be updated`);
                    throw error;
                });
            // 5.2. Use save() method
            moviesDB.collection('movies')
                .findOne({ name: moviesToAddField[1] })
                .then(movie => {
                    console.log(`\n|---> 5.2. Add a key called achievements to ${moviesToAddField[0]}, with save method`);
                    movie.achievements = hitArray[1];
                    moviesDB.collection('movies')
                        .save(movie)
                        .then(() => { console.log(`5.2. The movie ${moviesToAddField[1]} has been updated successfully`)})
                        .catch(error => {
                            console.log(`The movie ${moviesToAddField[1]} could not be updated`);
                            throw error;
                        });
                })
                .catch(error => {
                    console.log(`\n|---> 5.2. Add a key called achievements to ${moviesToAddField[0]}, with save method, could not be updated`);
                    throw error;
                });
            
            // 6. Query that returns all the movies that have both the 'Super hit'
            //    and the 'Super Duper hit' achievements
            moviesDB.collection('movies')
                .find({achievements: { $exists: true, $in: hitArray}})
                .toArray()
                .then(moviesAchievements => {
                    console.log(`\n6. Query that returns all the movies that have both the '${hitArray[0]}' and the '${hitArray[1]}' achievements`);
                    moviesAchievements.forEach((movie, index) => {
                        console.log(`${index+1}. ${JSON.stringify(movie)}`);
                    });
                })
                .catch(error => {
                    console.log(`\n6. Query that returns all the movies that have both the '${hitArray[0]}' and the '${hitArray[1]}' achievements`);
                    console.log(`None movie has achievements...`);
                    throw error;
                });
            
            // 7. Query that returns only those movies that have achievements
            moviesDB.collection('movies')
                .find({achievements: { $exists: true}})
                .toArray()
                .then(moviesAchievements => {
                    console.log(`\n7. Query that returns only those movies that have achievements`);
                    moviesAchievements.forEach((movie, index) => {
                        console.log(`${index+1}. ${JSON.stringify(movie)}`);
                    });
                })
                .catch(error => {
                    console.log(`\n7. Query that returns only those movies that have achievements`);
                    console.log(`None movie has achievements...`);
                    throw error;
                });
        });
    })
    .catch(error => {
        if (error) {
            console.log(`Something is wrong... DB & App-Server are not running`);
            throw error;
            //process.exit(0);
        }
    });
    
    
    // ,
    // (error, db) => {
    //     if (error) {
    //         console.log(`Something is wrong... DB & App-Server are not running`);
    //         // throw error;
    //         process.exit(0);
    //     }
    //     app.listen(process.env.APP_PORT, () => {
    //         console.log(`DB is up and running`);
    //         console.log(`App-Server is running on port --> ${process.env.APP_PORT}`);
    //     });
    //     const moviesDB = db.db('movies');
    //     // Create a collection called 'movies'
    //     moviesDB.createCollection('movies')
    //         .then(() => console.log(`'movies' collection has been created successfully`))
    //         .catch(error => {
    //             console.log(`'movies' collection could not be created`);
    //             // throw error;
    //             process.exit(0);
    //         });
    //
    //     const moviesCollection = moviesDB.collection('movies');
    //
    //     // 1. Add 5 movies to 'movies' collection
    //     moviesCollection
    //         .insertMany(movies)
    //         .then(() => console.log(`All 5 movies have been added to 'movies' collection`))
    //         .catch(error => {
    //             console.log(`None move could be added to 'movies' collection`);
    //             // throw error;
    //             process.exit(0);
    //         });
    //
    //     // 2. Query that returns all the movies
    //     moviesCollection
    //         .find({})
    //         .toArray()
    //         .then(data => console.log(`All movies in DB are: ${data}`))
    //         .catch(error => {
    //             console.log(`None movie could be retrieved from 'movies' collection`);
    //             // throw error;
    //             process.exit(0);
    //         });
    //     // 3. Query to find a movie name using findOne method
    //     // 4. Query that returns the three highest rated movies
    //     // 5. Add a key called achievements in any two documents.
    //     //    One document should have 'super hit' and other should have
    //     //    'Super Duper Hit' as value to key achievements.
    //     // 5.1. Use update() method
    //     // 5.2. Use save() method
    //     // 6. Query that returns all the movies that have both the 'Super hit'
    //     //    and the 'Super Duper hit' achievements
    //     // 7. Query that returns only those movies that have achievements
    // });
