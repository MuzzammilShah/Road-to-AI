<!-- ---
hide:
  - navigation
--- -->

# **:material-code-block-tags: TRANSFORMER MODEL - GPT 1**

**Timeline: 11th - 21st February, 2025**

## Introduction

This project is an implementation of a GPT-style language model following Andrej Karpathy’s (iconic, if i may add) "Let’s Build GPT from Scratch" video. It walks through the key components of modern transformers, from a simple bigram model to a fully functional self-attention mechanism and multi-headed transformer blocks.  

## Overview

- **Baseline Model**: Bigram language modeling, loss calculation, and text generation.
- **Self-Attention**: Understanding matrix multiplications, softmax, and positional encodings. 
- **Transformer Architecture**: Multi-head self-attention, feedforward layers, residual connections, and layer normalization.
- **Scaling Up**: Dropout regularization, encoder vs. decoder architectures (only decoder block has been implemented, no encoder).

## Structure of Contents

- `gpt-dev.ipynb` is the only and the main notebook where the implementation has been done from top to bottom.

- The notebook has three main sections: 

    1. Baseline language modeling and Code setup
    2. Building the "self-attention"
    3. Building the Transformer

    Each of these sections have their own respective sub sections breakdown in order.

- `bigram.md` provides a detailed breakdown of the initial python script which was made after section 1. 
- `gpt.py` is the name of the final python script actually containing the model implementation, you may find that in the [implementation project repo on my github](https://github.com/MuzzammilShah/GPT-TransformerModel-1).

!!! note "Changes from the original video and Notes"
    - I've used a different and a bigger dataset for this, namely the 'Harry Potter Novels' collection. I found the raw dataset on kaggle (as 7 individual datasets) after which i had them merged and cleaned up seperately, so that the outputs can be a lot more cleaner. You may find the notebooks which I had implemented for that under the `additional-files` directory, so feel free to check that out.
    - This model is trained on 6 million characters (so ~6 million tokens)
    - The final output can be found in the file `generated.txt`.
    - I ran this model on a **NVIDIA GeForce GTX 1650** of my personal laptop with a decent amount of GPU memory (**CUDA Version 12.6**) and it took **approximately 90 minutes** to train and generate the final document.
    - I've also added breakdowns of the codes based on andrej's explainations and how much I understood so feel free to read them as well.

&nbsp;

*Have fun, Happy Learning!*