---
title: Agentic AI
date:
  created: 2025-10-28
categories:
  - AI Agents
---

<div align="center">
<img src="/assets/images/blog-assets/thumbnails/post-4.png" alt="Post 4 Thumbnail" width="100%">
</div>

<!-- more -->

&nbsp;

# :material-book-education-outline: Agentic AI (My course notes)

## **Introduction to Agentic Workflows**
-----

### **What is Agentic AI?**

An agentic AI workflow is a process where an LLM based app executes multiple steps to complete a task.

Knowing how to decompose the task into steps and how to build the components to execute the individual steps turns out to be a tricky but important skill that will determine our ability to build agentic workflows for a huge range of exciting applications.

Lets say we are building a comprehensive research agent- So when asked a query (like, how can we complete with SpaceX?) this agent starts with planning out what research to use, including calling a web search engine to download some web pages, and then to synthesize and rank findings, draft an outline, have an editor-to-agent review for coherence, and then finally generate a comprehensive markdown report. So, the final output will be on building a new rocket company to compete with SpaceX with an intro, background, findings, and so on.

Now, one of the often-discussed areas of AI agents is how autonomous are they? What we read above was a relatively complex, highly autonomous Agentic AI workflow, but there are also other simpler workflows that are incredibly valuable.

### **Degrees of autonomy**

<div align="center">
<img src="/assets/images/blog-assets/post-4-assets/module-1/degrees-of-autonomy.png" alt="Agentic AI" width="80%" style="border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
</div>

<div align="center">
<img src="/assets/images/blog-assets/post-4-assets/module-1/degrees-of-autonomy-2.png" alt="Agentic AI" width="80%" style="border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
</div>

Keeping the above diagram in mind, You will find that there are tons of applications in the less autonomous end of the spectrum that are very valuable being built for tons of businesses today, and at the same time, there are also applications being worked on at the more highly autonomous end of the spectrum, but those are usually less easily controllable, a little bit more unpredictable, and also a lot of active research as well to figure out how to build these more highly autonomous agents.

### **Benefits of Agentic AI**

I think the one biggest benefit of agentic workflows is that it allows you to do many tasks effectively that just previously were not possible. But there are other benefits as well, including parallelism (which we will talk about after the coding benchmark example) that lets you do certain things quite fast, as well as modularity that lets you combine the best of three components from many different places to build an effective workflow.

<div align="center">
<img src="/assets/images/blog-assets/post-4-assets/module-1/benchmark-gpt3.5-vs-gpt4.png" alt="Agentic AI" width="80%" style="border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
</div>

First comes *Coding Benchmark*: The diagram above shows us the data on a coding benchmark that tests the ability of different LLMs to write code to carry out certain tasks. The benchmark used in this case is called Human Eval. It turns out that GPT 3.5, if asked to write the code directly, gets 40% right on this benchmark. This is a positive k-metric. GPT 4 is a much better model. Its performance leaps to 67% with this also non-agentic workflow.

But it turns out that as large as the improvement was from GPT 3.5 to GPT 4, that improvement is dwarfed by what you can achieve by wrapping GPT 3.5 within an agentic workflow.

Using different agentic techniques (which we will learn more on later), you can prompt GPT 3.5 to write code and then maybe reflect on the code and figure out if you can improve it. And using techniques like that, you can actually get GPT 3.5 to get much higher levels of performance. And similarly, GPT 4 used in the context of an agentic workflow also does much better. 

So even with today's best LLMs, an agentic workflow lets you get much better performance. And in fact, what we saw in this example was the improvement from one generation of model to another, which is huge, is still not as big a difference as implementing an agentic workflow on the previous generation of model.

<div align="center">
<img src="/assets/images/blog-assets/post-4-assets/module-1/parallelization-1.png" alt="Agentic AI" width="80%" style="border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
</div>

<div align="center">
<img src="/assets/images/blog-assets/post-4-assets/module-1/parallelization-2.png" alt="Agentic AI" width="80%" style="border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
</div>

Next comes *Parallelization*: This is another benefit of using agentic workflows where they can parallelize some tasks and thus do certain things much faster than a human. The first diagram shows how it can do almost 9 web searches at once. Second diagram shows how we can experiment with it by changing the specific components like the search API or even trying out different LLMs rather than sticking with just one for all the different steps, to see which modifications can provide better outputs for our task.

### **Agentic AI Applications**

Here we’ve seen the different types of agentic applications currently in use, like customer service etc. The main point to takeaway would be the below diagram which shows how easy/hard it is to build your agent based on what you have.

<div align="center">
<img src="/assets/images/blog-assets/post-4-assets/module-1/agentic-ai-applications.png" alt="Agentic AI" width="80%" style="border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
</div>

So, when implementing one of these things yourself, one of the most important skills is to look at a complex workflow and figure out what are the individual steps so you can implement an agentic workflow to execute those steps one at a time. And that is exactly what we will be looking at in Task decomposition.

