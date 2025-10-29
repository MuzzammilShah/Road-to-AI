---
title: Agentic AI
date:
  created: 2025-10-28
  updated: 2025-10-29
categories:
  - AI Agents
---

<div align="center">
<img src="/assets/images/blog-assets/thumbnails/post-4.png" alt="Post 4 Thumbnail" width="100%">
</div>

<!-- more -->

&nbsp;

# :material-book-education-outline: Agentic AI (My course notes)

!!! note "All code implementations can be found in [my repository on github]()"

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

### **Task decomposition**

One of the key skills in building agentic workflows is to look at a bunch of stuff that maybe someone does and to identify the discrete steps that it could be implemented with.

And when I'm looking at the individual discrete steps, one question I'm always asking myself is, can this step be implemented with either an LLM or with one of the tools such as an API or a function call that I have access to? And in case the answer is no, I'll then often ask myself, how would I as a human do this step? And is it possible to decompose this further or break this down into even smaller steps that then maybe is more amenable to implementation with an LLM or with one of the software tools that I have?

<div align="center">
<img src="/assets/images/blog-assets/post-4-assets/module-1/task-decomposition.png" alt="Agentic AI" width="80%" style="border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
</div>

### **Evaluation (evals)**

"Your ability to drive evals for your agentic workflow makes a huge difference in your ability to build them effectively."

There are some simple ways to evaluate your agent like:

- You can write codes to evaluate *objective criteria*, such as 'did it mention a competitor or not'.
- Using an LLM as a judge for more *subjective criteria* such as 'what's the quality of this essay'.

But later, we will learn about two major types of evals:

- One is *end-to-end*, where you measure the output quality of the entire agent.
- Other is *component level* evals, where you measure the quality of the output of a single step in the agentic workflow.

It turns out that these are useful for driving different parts of your development process.

There is another method apart from this where you just examine the *intermediate outputs* - we call these the *traces of the LLM*, in order to understand where it is falling short of my expectations. And we call this *error analysis*, where we just read through the intermediate outputs of every single step to try to spot opportunities for improvement.

### **Agentic design patterns**

1. Reflection
2. Tool Use
3. Planning
4. Multi-agent collaboration

*(There were some great slides which showed examples on the above, feel free to watch that. But since we will be diving deep into this as well, I didn't want to get hung around in just the overview stuff for now).*

*Update: Also damn, the quiz was slightly more tricky than I thought it would be lol. But its done and I also tried out the research agent which was already developed by sensei, you can checkout it's output [here](../../assets/images/blog-assets/post-4-assets/module-1/final_report.html), very impressive actually. Now we move on!*

<div class="x-twitter-embed" data-url="https://twitter.com/MoShahx07/status/1983342282142343654">
    <blockquote class="twitter-tweet">
		<a href="https://twitter.com/MoShahx07/status/1983342282142343654"></a>
    </blockquote>
</div>

&nbsp;

## **Reflection Design Pattern**
-----

### **Reflection to improve outputs of task**

One design consideration to keep in mind is, reflection is much more powerful when there is new additional external information that you can ingest into the reflection process.

For example, if you can run the code and have that code output or error messages as an additional input to the reflection step, that really lets the LLM reflect much more deeply and figure out what may be going wrong. This results in a much better second version of the code than if there wasn't this external information that you can ingest. So one thing to keep in mind, whenever reflection has an opportunity to get additional information, that makes it much more powerful.

The attached diagram shows exactly that, where rather than just feeding the provided code from step 1 back into reflection, we execute it ourselves and give additional data for reflection, therefore providing us with a better output.

<div align="center">
<img src="/assets/images/blog-assets/post-4-assets/module-2/reflection-with-external-feedback.png" alt="Agentic AI" width="80%" style="border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
</div>

Reflection does not make an LLM always get everything right 100% of the time, but it can often give it maybe a modest bump in performance.

### **Why not just direct generation?**

Direct generation aka Zero shot prompting. There are different types of how we can provide all possible information to the LLM.

<div align="center">
<img src="/assets/images/blog-assets/post-4-assets/module-2/zero-one-few-shot-prompting.png" alt="Agentic AI" width="80%" style="border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
</div>

Below diagram is adapted from the research paper by Madaan and others, and this shows a range of different tasks being implemented with different models and with and without reflection. The way to read this diagram is to look at these pairs of adjacent light followed by dark-colored bars, where the light bar shows zero-shot prompting and the dark bar shows the same model but with reflection.

<div align="center">
<img src="/assets/images/blog-assets/post-4-assets/module-2/study-showing-improvement.png" alt="Agentic AI" width="80%" style="border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
</div>

So some tips for writing reflection prompts: It helps to clearly indicate that you want it to review or to reflect on the first draft of the output. And if you can specify a clear set of criteria/instructions in points, such as whether the domain name is easy to pronounce and whether it may have negative connotations or for email, check the tone and verify the facts. Then that guides the LLM better in reflecting and critiquing on the criteria that you care the most about.

### **Chart generation workflow**

This is a fun example where we'll start to look at multi-modal inputs and outputs. We'll have an algorithm reflect on an image being generated or a chart being generated. 

!!! note "Code for this can be found in the repo mentioned at the start of this blog!"

One thing you may find is that sometimes using a reasoning model for reflection may work better than a non-reasoning model.

Now, when you're building an application, one thing you may be wondering is, does reflection actually improve performance on your specific application? From various studies, reflection improves performance by a little bit on some, by a lot on some others, and maybe barely any at all on some other applications.

And so it'll be useful to understand its impact on your application and also give you guidance on how to tune either the initial generation or the reflection prompt to try to get better performance.

### **Evaluating impact of reflection**

Reflection often improves the performance of the system, but before I commit to keeping it, I would usually want to double check how much it actually improves the performance, because it does slow down the system a little bit by needing to take an extra step.

Let's take a look at evals for reflection workflows.

Let's look at an example of using reflection to improve the database query that an LLM writes to fetch data to answer questions. Let's say you run a retail store, and you may get questions like, which color product has the highest total sales? To answer a question like this, you might have an LLM generate a database query. After writing a database query, instead of using that directly to fetch information from the database, you may have an LLM, the same or different LLM, reflect on the version one database query and update it to maybe an improved one, and then execute that database query against the database to fetch information to finally have an LLM answer the question.

So the question is, does using a second LLM to reflect and improve on the database or SQL query actually improve the final output? In order to evaluate this, I might collect a set of questions or set of prompts together with ground truth answers. So maybe one would be, how many items are sold in May 2025? What's the most expensive item in the inventory? How many styles are carried in my store? And I write down for maybe 10, 15 prompts, the ground truth answer. Then you can run this workflow without reflection. So without reflection would mean to take the SQL query generated by the first LLM and to just see what answer it gives. And with reflection would mean to take the database query generated after the second LLM has reflected on it to see what answer that fetches from the database. And then we can measure the percentage of correct answers from no reflection and with reflection. In this example, no reflection gets the answers right 87% of the time, with reflection gets it right 95% of the time. And this would suggest that reflection is meaningfully improving the quality of the database queries I'm able to get to pull out the correct answer.

One thing that developers often end up doing as well is rewrite the reflection prompt. So for example, do you want to add to reflection prompt an instruction to make the database query run faster or make it clearer? Or you may just have different ideas for how to rewrite either the initial generation prompt or the reflection prompt. Once you put in place evals like this, you can quickly try out different ideas for these prompts and measure the percentage correct your system has as you change the prompts in order to get a sense of which prompts work best for your application. *So if you're trying out a lot of prompts, building evals is important.*

<div align="center">
<img src="/assets/images/blog-assets/post-4-assets/module-2/evaluation-impact-1.png" alt="Agentic AI" width="80%" style="border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
</div>

It really helps you have a systematic way to choose between the different prompts you might be considering. But this example is one of when you can use objective evals because there is a right answer. The number of items sold was 1,301 and the answer is either right or wrong. How about applications where you need more subjective rather than objective evaluations? In the plotting example that we saw in the previous example, without reflection we had the stack bar graph, with reflection we had this graph. But how do we know which plot is actually better? Measuring which of those plots is better is more of a subjective criteria rather than a purely black and white objective criteria. *So for these more subjective criteria, one thing you might do is use an LLM as a judge.* 

And maybe a basic approach to do this might be to feed both plots into an LLM, a multi-modal LLM that can accept two images as input, and just ask it which image is better. It turns out this doesn't work that well as it turns out that there's some known issues of using LLMs to compare two inputs to tell you which one is better. First, it turns out the answers are often not very good. It could be sensitive to the exact wording of the prompt of the LLM as a judge, and sometimes the rank ordering doesn't correspond that well to human expert judgment. And one manifestation of this is *many LLMs will have a position bias*. Many LLMs, it turns out, will often pick the first option more often than the second option.

So, Instead of asking an LLMs to compare a pair of inputs, *grading with a rubric can give more consistent results*. So, for example, you might prompt an LLM to tell it, given a single image, assess the attached image against the quality rubric, and the rubric or grading criteria may have clear criteria like does the plot have a clear title, are the access labels present, is it an appropriate chart type, and so on, with a handful of criteria like this. Even here, it turns out that instead of asking the LLM to grade something on a scale of 1 to 5, which it tends not to be well calibrated on, if you instead give it, say, 5 binary criteria, 5-0-1 criteria, and have it give 5 binary scores, and you add up those scores to get the number from 1 to 5 or 1 to 10 if you have 10 binary criteria, that tends to give more consistent results. 

<div align="center">
<img src="/assets/images/blog-assets/post-4-assets/module-2/evaluation-impact-2.png" alt="Agentic AI" width="80%" style="border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
</div>

And so if we're to gather a handful, say 10-15 user queries for different visualizations that the user may want to have of the coffee machine sales, then you can have it generate images without reflection or generate images with reflection, and use a rubric like this to score each of the images to then check the degree to which or whether or not the images generated with reflection are really better than the ones without reflection. And then once you've built up a set of evals like this, if ever you want to change the initial generation prompt or you want to change the reflection prompt, you can also rerun this eval to see if, say, updating one of your prompts allows the system to generate images that scores more points according to this rubric. And so this too gives you a way to keep on tuning your prompts to get better and better performance. 

What you may find when building evaluations for reflection or for other agentic workflows is that when there is an objective criteria, code-based evaluation is usually easier to manage. And in the example that we saw with the database query, we built up a database of ground truth examples and ground truth outputs and just wrote code to see how often the system generated the right answer in a really objective evaluation metric. In contrast for small subjective tasks, you might use an element as a judge but it usually takes a little bit more tuning, such as having to think through what rubric you may want to use to get the LLM as a judge to be well calibrated or to output reliable evals.

### **Using external feedback**

The diagram below should clearly tell you why external feedback is important.

<div align="center">
<img src="/assets/images/blog-assets/post-4-assets/module-2/roi-on-prompt-engg.png" alt="Agentic AI" width="80%" style="border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
</div>

Finally, as we move on to tool calling, the below examples show where tools fit in to provide better results. So, Challenge -> Source of feedback (tool) need to solve it.

<div align="center">
<img src="/assets/images/blog-assets/post-4-assets/module-2/tool-calling-egs.png" alt="Agentic AI" width="80%" style="border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
</div>

&nbsp;