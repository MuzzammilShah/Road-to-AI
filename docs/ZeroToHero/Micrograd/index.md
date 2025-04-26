<!-- ---
hide:
  - navigation
--- -->

# **:material-chart-timeline-variant-shimmer: BACKPROPAGATION - Using an AutoGrad Engine**

**Timeline: 2nd - 27th October, 2024**

## Introduction

Welcome to my documentation for the Micrograd video from Andrej Karpathy's Neural Networks: Zero to Hero series. This lecture provides a detailed exploration of **Micrograd, a tiny autograd engine** designed for educational purposes. In this documentation, I’ve compiled my notes and insights from the lecture to serve as a reference for understanding the core concepts of automatic differentiation and backpropagation in neural networks.

## Overview of Micrograd

In this part of the series, I focused on the following key topics:

**Understanding Micrograd**: Micrograd is an autograd engine that simplifies the process of building and training neural networks. It allows users to define mathematical expressions and automatically compute gradients, which are essential for optimizing neural network weights.

**Key Concepts Covered**:

- **Core Value Object**: The foundation of Micrograd is the Value object, which holds both a value and its gradient. This object is crucial for tracking computations and gradients during backpropagation.
  
- **Forward Pass**: The forward pass involves computing the output of a neural network given an input and its weights. This step is essential for evaluating the performance of the model.

- **Backpropagation Process**: Backpropagation is explained as a recursive application of the chain rule in calculus, allowing us to calculate gradients efficiently. This process is vital for updating weights during training.

- **Building Mathematical Expressions**: The lecture demonstrates how to create expressions using basic operations (addition, multiplication) and how these can be visualized as computation graphs.

- **Implementing Neural Network Structures**: The video walks through creating a simple multi-layer perceptron (MLP) using Micrograd, illustrating how minimal code can lead to effective neural network training.

## Key Resources

**Video Lecture**

- I watched the lecture on YouTube: [Building Micrograd](https://youtu.be/PaCmpygFfXo?si=YW_rkr7LU44YwouD)

**Codes:**

- The Jupyter notebooks and code implementations are available within this documentation itself.
- If you wish to view the repository where I originally worked on, you can view it here: [Neural Networks - Micrograd Implementation)](https://github.com/MuzzammilShah/NeuralNetworks-Micrograd-Implementation)
- The Official full implementation of Micrograd is available on GitHub: [Micrograd Repository](https://github.com/karpathy/micrograd)

## Structure of Contents

- There are two main sections: **Lecture Notes** and **Notebooks**.

- The documentation for this lecture has been divided based on the topic, as there were many individual concepts that had to be convered.

- Everything has been arranged in order, you just have to follow the default navigation path provided.

- The main notebook with timestamps is under ['Master Notes'](notes/A-main-video-lecture-notes.md).

- The additional notes can be navigated through the Master notes itself. If you feel like jumping directly to a topic, feel free to do so.

- **Important: It is recommended to start from the 'Master Notes' page, this is your main page for the lecture, you'll be guided to the rest of the topics in the necessary sections within this page itself.**

- The jupyter notebooks have also been divided and arranged based on the respective topic for simpler navigation and understanding.

&nbsp;

*Have fun, Happy Learning!*