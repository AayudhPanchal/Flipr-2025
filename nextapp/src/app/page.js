"use client";

import React, { useEffect, useState } from 'react';
import { dummyNews, categories } from '../utils/data';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SubcategoryFilter from './components/SubcategoryFilter';
import NewsCard from './components/NewsCard';
import Footer from './components/Footer';

export default function Home() {
  const [locationAllowed, setLocationAllowed] = useState(false);
  const [news, setNews] = useState([]);
  const [category, setCategory] = useState('general');
  const [subCategory, setSubCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const updateLocation = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            console.log('📍 Location Updated:', newLocation);
            setUserLocation(newLocation);
            sessionStorage.setItem('locationAllowed', 'true');
            setLocationAllowed(true);
          },
          (error) => {
            console.error('🚫 Location Error:', error.message);
            setLocationAllowed(false);
          }
        );
      }
    };

    // Update location on mount and every 5 minutes
    updateLocation();
    const intervalId = setInterval(updateLocation, 300000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      try {
        const url = new URL('http://localhost:5000/search');
        url.searchParams.append('category', category);
        url.searchParams.append('subcategory', subCategory);
        if (userLocation) {
          url.searchParams.append('lat', userLocation.lat);
          url.searchParams.append('lng', userLocation.lng);
        }
        
        console.log('🔍 Fetching news from scraper:', url.toString());
        const response = await fetch(url);
        const data = await response.json();
        
        const processedArticles = data.map(article => ({
          ...article,
          id: btoa(article.url || Math.random().toString())
        }));

        setNews(processedArticles);
      } catch (error) {
        console.error('Error fetching news:', error);
        setNews([]);
      }
      setIsLoading(false);
    };

    if (category || subCategory) {
      fetchNews();
    }
  }, [category, subCategory, userLocation]);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <Hero 
        categories={categories} 
        category={category} 
        setCategory={setCategory} 
        setSubCategory={setSubCategory} 
      />
      <SubcategoryFilter 
        category={category} 
        subCategory={subCategory} 
        setSubCategory={setSubCategory} 
        categories={categories} 
      />
      
      <section className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((article, index) => (
              <NewsCard key={index} article={article} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}