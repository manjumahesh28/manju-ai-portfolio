---
title: Project — Skin Disease Prediction
---

# Project — Skin Disease Prediction

## Overview
Manju built a skin disease prediction project using deep learning. She preprocessed a medical image dataset and trained a DenseNet-based model to classify skin conditions from images. A Flask web app lets a user upload an image and see the predicted condition.

## Tech stack
- Language: Python
- Model: DenseNet (a convolutional neural network for image classification)
- Web app: Flask
- TODO: deep-learning library (TensorFlow/Keras or PyTorch)

## Dataset and preprocessing
Manju preprocessed the images before training, resizing and normalising them so the model gets consistent input.
- TODO: dataset name (for example HAM10000 or a Kaggle dataset) and number of images

## Model
The model is based on DenseNet. In DenseNet, each layer receives the outputs of all earlier layers in its block, which lets the network reuse features and works well for image classification.
- TODO: number of classes and their names
- TODO: whether you started from pretrained ImageNet weights (transfer learning)
- TODO: accuracy on the test set

## How the app works
1. The user uploads a skin image on the Flask web page.
2. The image is resized and normalised the same way as the training images.
3. The DenseNet model predicts the skin condition.
4. The page shows the predicted condition.

## Limitations
This is a learning project, not a medical device, and its predictions are not a diagnosis.

## Links
- TODO: GitHub link