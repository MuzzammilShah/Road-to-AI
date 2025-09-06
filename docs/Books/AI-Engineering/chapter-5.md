---
hide:
  - toc
---
# :material-owl: **AI Engineering** by Chip Huyen

## Chapter 5

*Topic: Prompt Engineering*

-----

:material-progress-star-four-points: **Instructions to a model**

- It is important to evaluate the model's instruction following capability. As sometimes no matter how good the prompt is, if the model is bad at it, it won't be able to do it.
- GPT-4 works better when there is a task description on the top. On the contrast, Llama3 works better when there is a task description on the bottom.


> Models are better at understanding instructions when either given at the beginning or at the end, rather than in the middle.
> If you feel the models performance becoming worse when provided with more context, then you should consider a way to shorten your prompts.
> 
> **During outputs: Mention 'Don't want preambles' (Those initial bot responses).**

&nbsp;

:material-progress-star-four-points: **Context to models**

Providing context to models can mitigate hallucinations:

- If the model is not provided with the necessary info, then it will have to rely on it's internal knowledge (which might be unreliable, causing it to hallucinate).
- Or just give it tools to gather info:

	- The process of gathering necessary context for a given query is called **Context Construction**.

&nbsp;

:material-progress-star-four-points: **Quick important tips**

- Decompose a prompt into smaller prompts targeting different subtask.
- Read the prompting guide provided by the developer (if any).
- Use the model playground to understand the model.
- Version your prompts - Test you changes systematically.
- Standardize your evaluation metrics and evaluation data, so that we can compare the performance of different tasks.
- Evaluate your prompt for the system as a whole. As sometimes it way do well for a subtask but bad for the whole system.

&nbsp;