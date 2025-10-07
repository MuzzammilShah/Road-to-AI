---
title: Open Source LLMs
date:
  created: 2025-10-02
  updated: 2025-10-07
categories:
  - GPTs and LLMs
---

<div align="center">
<img src="/assets/images/blog-assets/thumbnails/post-3.png" alt="Post 3 Thumbnail" width="100%">
</div>

<!-- more -->

&nbsp;

# :simple-ollama: Ollama - The Pros and Cons

!!! note "Ongoing article"

### **Model performance**

One major issue I had observed was users had to wait for a few seconds before the model could start responding. Now that doesn't really sound like a big deal, but when you are trying to push your users to use a private, secured GPT environment you also essentially have to convince them to move away from the brilliant ChatGPT platform (which is not an easy task). One major thing which makes ChatGPT very attractive is its performance. The speed of response is just ridiculously fast. We can't obviously match the infrastructure they have for the computation, but we can make our system marginally better.

> While this is something I am still exploring (will update this section as I find more) here are a few tweaks I did find.

Keeping the Model "warm" - Now this involves choosing one model and making sure it always runs whether it's been invoked or not. So Ollama remains active in the GPU resource therefore able to pull up more juice for faster response time. This way when the user does call the model for a query it responds almost immediately.

<div align="center">
<img src="/assets/images/blog-assets/post-2-assets/owu-1.png" alt="Ollama control" width="80%" style="border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
</div>

<div align="center">
<img src="/assets/images/blog-assets/post-2-assets/owu-2.png" alt="Ollama control" width="80%" style="border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
</div>

Now this obviously comes with its drawbacks. A major one was already addressed - Infrastructure. Normally we do not really have that much GPU memory to always keep that resource active. What about the other projects which are running on our server? While GPU utilization implemented in NVIDIA Drivers is pretty intelligent, we need to keep an eye too. Take a look at the following image:

<div align="center">
<img src="/assets/images/blog-assets/post-2-assets/owu-3.png" alt="Ollama control" width="80%" style="border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
</div>

So from what I have observed so far, the other parameter tweaks that you do to a model directly impact the GPU utilization for it. In my case, I have noticed a change whenever I change the context window of a model.

<div align="center">
<img src="/assets/images/blog-assets/post-2-assets/owu-4.png" alt="Ollama control" width="80%" style="border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
</div>

I might be wrong here, maybe there is another factor causing this. But it is worth noting that you have to be very aware of the environment you are working in. While it's very tempting to reach the performance capability of ChatGPT it's also important to understand what the limits of your environment are as well as you cannot afford to have any downtime while you have users using your application.