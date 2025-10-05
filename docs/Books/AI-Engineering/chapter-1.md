---
hide:
  - toc
---
# :material-owl: **AI Engineering** by Chip Huyen

## **Chapter 1**

*Topic: Introduction - AI Engineering*

-----

:material-progress-star-four-points: **AI Engineering:** The process of building applications on top of readily available ML models.

&nbsp;

:material-progress-star-four-points: **Tokens/Tokenization:**

- The basic unit of a language model is called **Token**.

	- A token can be a character, a word or even a part of a word (like *-tion*) depending on the model.
	- But in the same way, for non-English languages, a single unicode character can be represented in multiple tokens.

- The process of breaking down the original text into tokens is called **Tokenization**. (*Note: For GPT-4 an average token is 3/4 of length of the word. So 100 tokens are approx 75 words*).

- The set of all tokens a model can work with is called the model's **Vocabulary**.

- A small number of tokens can be used to construct a large number of distinct words. *Similar to how we can use few letters of the alphabet to construct more words.*

- Vocabulary of different models:

	- Mistral 8x7B -> 32,000
	- GPT-4 -> 100,256

> Tokenization method and Vocabulary size are decided by the model developers.

&nbsp;

:material-progress-star-four-points: **Why do language models prefer models prefer tokens as their unit instead of words?**

- Tokens allow words to be broken up into different meaningful components. *Example: Try + ing*.
- There are much less unique tokens compared to unique words.
- Can handle even unknown words like *chatgpting*.

Therefore, a balance is maintained between: (1) Fewer units than words and (2) Retaining more meaning than individual characters.

&nbsp;

:material-progress-star-four-points: **Types of Language Models (LMs):** Masked LM and Autoregressive LM.

- Masked LM: Has context surrounding the token which needs to be predicted.

	*Why does the* [predict] *cross the road?*

- Autoregressive LM: Has only the previous tokens as context to predict the next token.

	*Why does the chicken cross the* [predict]

So, when can we use either?

- Masked:

	- BERT (Bidirectional Encoded Representations from Transformers)
	- Commonly used for non-generative tasks like Sentiment Analysis and Text Classification.
	- Useful for tasks requiring overall context, code debugging etc.

- Autoregressive:

	- Predicts next token based on the proceeding tokens.
	- Text Generation (therefore this is more popular haha)

&nbsp;

:material-progress-star-four-points: **Language Models**

Language models are just one of the different ML algorithms like Object detection, Topic modeling, Recommender systems, Weather forecasting, Stock prediction etc. But what made them different is the process of training called *self-supervision*.

- Supervised training: Training ML algorithm using labelled data.
- Self-Supervised training: Instead of taking explicit labels, models infer labels from input data.

Like we've seen `<BOS>` `<EOS>` where they are essential markers and each is treated as one special token.

The size of the language model is determined by a term called **Parameters**. This is the variable that is updated through the learning process.

> The parameters refer only to the weights of the model, not biases.

Therefore we can say - more the parameters, greater is its capacity to learn desired behaviors.

> Interesting takes:
>
> - A large model would require more training data to maximize their compute (seems counter intuitive right? think through it)
> - Large model have more capacity to learn, therefore more data.
>
> You can train a large model with small dataset, but that's a waste of compute. You can instead achieve similar results with smaller LM.

&nbsp;

:material-progress-star-four-points: **Large Multimodal Model (LMM)**

A model that can work with more than one modality. Example: Can process both text and images to produce outputs.

&nbsp;

:material-progress-star-four-points: **Embedding** (Simple definition): Vectors that aim to capture the meaning of the original text.

&nbsp;

:material-progress-star-four-points: **Three layers of the AI Stack**

1. **Application Development**: AI Interface, Prompt engineering, Context construction, Evaluation.
2. **Model Development**: Modeling and Training, Inference Optimization, Fine tuning, Dataset engineering, Evaluation.
3. **Infrastructure**: Model serving, Managing data, Compute and monitoring.

&nbsp;

:material-progress-star-four-points: **Prompting vs Fine-tuning**

- Prompting: Adapting a model without updating the model weights.
- Fine-tuning: Requires updating model weights.

&nbsp;