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

Now this obviously comes with its drawbacks. A major one was already addressed - Infrastructure. Normally we do not really have that much GPU memory to always keep that resource active. What about the other projects which are running on our server? While GPU utilization implemented in NVIDIA Drivers is pretty intelligent, we need to keep an eye too.

So from what I have observed so far, the other parameter tweaks that you do to a model directly impact the GPU utilization for it. In my case, I have noticed a change whenever I change the context window of a model.

<div align="center">
<img src="/assets/images/blog-assets/post-2-assets/owu-3.png" alt="Ollama control" width="80%" style="border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
</div>
<div align="center" style="font-size: 0.7em; font-style: italic;">Outputs we observe with and without ollama-alive</div>

<div align="center">
<img src="/assets/images/blog-assets/post-2-assets/owu-4.png" alt="Ollama control" width="80%" style="border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
</div>
<div align="center" style="font-size: 0.7em; font-style: italic;">Variations in GPU utilization based on models and it's context size</div>

I might be wrong here, maybe there is another factor causing this (*Update: Nope, turns out I my intuition was right here hehe. More on that below.*). But it is worth noting that you have to be very aware of the environment you are working in. While it's very tempting to reach the performance capability of ChatGPT it's also important to understand what the limits of your environment are as well as you cannot afford to have any downtime while you have users using your application.

-----

Okay so the Model Context Window that we assign was definetly a factor. Here are a couple of observations I've made.

- System Details: Ubuntu, 8GB VRAM on a NVIDIA GTX 1080 GPU (That should say a lot)
- Given the GPU capacity, I can properly run only ONE model at a time. SLM more than a LLM, so anything less than the size of 10B works just fine.
- While that solves the speed of response of the model, the main issue is its context window. The default size is in the range of 2K to 4K which Open WEBUI and Ollama allocate. For a model to answer better, it needs more information therefore more context is needed. But more context means more computation therefore a load on our GPU.
- For the current system, I used `llama3.2:3b` and `gemma3:4b` alternatively, ranging their context size from 10,000 upto 50,000 MAX. As you increase the size you will observe a slight delay in response.
- Now, another alternative to reduce the load on the GPU is to use a *quantized* version of the model. Which is why I went ahead and pulled `llama3.2:3b-instruct-q4_0` and `gemma3:4b-it-q4_K_M1`. A quick note on what a quantized model is- Basically the same capability of its original paramaters just that its a lot more squashed out so the GPU doesn't have to work on it too much like it normally would (Yeah that was bad. Its like a pixelated image but still contains all the main core contents). I suggest you go ahead and watch [this part of the video](https://youtu.be/FQTorLqMyMU?si=zam6UgxNMPhTOZUd&t=45) to have a better understanding then lol. Anyway, using these versions of the model did make a slight difference as the GPU utilization while using these went from 90% down to 67%, so there was definetly some load taken off.

- **The Major dissapointment part:** Achieving recent relavent data. Now, I had also implemented Web Search functionality via Tavily API and Ollama API (latter is more recent). Although they did seem to pull up the right links for the sources (sometimes even that went wrong), the models just fail to utilize them. There were times it just wouldn't parse through the links and others the context size isn't big enough to process all the information.

Now here is where I move to the next phase as I did above.

- Upon research I found that even during web search and the sources that is retrieved, the average context size of that will only be from 2K to 10K MAX (this is obviously a rough estimated range given how simple my questions to the LLM were). So the LLM still should have sufficient context window remaining to process the information and give me even the slightest correct answer.
- Next, it may possible that the sources which my web search tools are returning may not even be fed into the model. Or the web search tools are only returning links to it but not scraping the data and providing it to the model (because the model itself can't scrape the links on its own obviously).
- The 'Thinking VS Non-Thinking models' delemma. The main factor which put open-source models on the map when challenging the proprietary ones were it's thinking capabilities. `deepseek-r1` could think longer and produce good outputs. But we already know 'thinking' means 'more tokens' therefore 'increased context size'. Whereas the Non-thinking models do not produce as impressive outputs.
- Lastly, the web search API itself. I've been using the free tier versions of those APIs so that might even be a limitation to their capabilities. Probably using APIs from Chrome, Brave or Perplexity may provide better results (provided the model processes them correctly).

While the problem of utilizing the power of our GPU to the right amount has been solved, the next challenge is to be able to produce accurate results for our queries.

-----

