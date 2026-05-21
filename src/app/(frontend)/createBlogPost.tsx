"use client";
import React from 'react';
import { useState } from 'react';
import axios from 'axios';


interface BlogPost {
    title: string;
    content: string;
    author: string;
    status: string;
    date: string;
}

const BlogPostContent = () => {
    const [blogPost, setBlogPost] = useState<BlogPost | null>(null);

    const createBlogPost = async () => {
        try{
            const data = {
                title: 'My First Blog Post',
                content: 'This is the content of my first blog post.',
                author: 'John Doe',
                status: 'published',
                date: new Date().toISOString(),
            };

            const response = await axios.post('http://localhost:3000/content', data);
            console.log('Blog post created:', response.data);
            setBlogPost(response.data);
        } catch (error: Error | any) {
            console.error('Error creating blog post:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status code:', error.response.status);
            } else {
                console.error('Error message:', error.message);
            }
        }
    }
    return (
    <>
        <div>
            <h1>Create a Blog Post</h1>
            <form onSubmit={createBlogPost}>
                <button type="submit">Create Blog Post</button>
                {blogPost && (
                    <div>
                        <h2>{blogPost.title}</h2>
                        <p>{blogPost.content}</p>
                        <p>Author: {blogPost.author}</p>
                        <p>Status: {blogPost.status}</p>
                        <p>Date: {new Date(blogPost.date).toLocaleString()}</p>
                    </div>
                )}
            </form>
        </div>
    
    </>
    )
}

export default BlogPostContent;