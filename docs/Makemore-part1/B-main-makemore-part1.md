
-------
-----------

##### **CHAPTER** [01:02:57](https://www.youtube.com/watch?v=PaCmpygFfXo&t=3777s) PART 2: the neural network approach: intro

(Start from 01:03:40)
Now in the first half of this, we arrived at the model doing everything explicitly. We were performing counts and we were normalizing those counts. 
Now, we'll be doing an alternative approach but the final output will be the same.
**Here we are going to cast the problem of Bigram Character level language modelling into a neural network**

So our NN will still be a character level language model.
So we have an input character -> given to the neural network and then it is gonna predict the probability -> of the next character that is likely to follow. 
And in addition to that, we are going to be able to evaluate any setting of the parameters of the langauage model, because we have a loss function value (The NLL).

So we are going to look at the probability distributions and we are going to look at its labels (in the NN) which are basically the identity of the next character in the Bigram. 

So knowing what character comes next is the bigram, allows us to check what will be the probability value assigned to that character (So higher the value, the better. Because it is another way of saying that the loss is low).

**We're gonna use gradient based optimization to tune the parameters of this network.**
Because we have a loss function and we're gonna minimize it. 
We're gonna tune the weights, so that the NN is gonna correctly predict the next probability of the next characters.

&nbsp;

##### **CHAPTER** [01:05:26](https://www.youtube.com/watch?v=PaCmpygFfXo&t=3926s) creating the bigram dataset for the neural net



We have created a training dataset. Where we have integer representations of the letter from a word/name.
```
. e 
e m 
m m 
m a 
a .

tensor([ 0, 5, 13, 13, 1])

tensor([ 5, 13, 13, 1, 0])
```

&nbsp;

##### **CHAPTER** [01:10:01](https://www.youtube.com/watch?v=PaCmpygFfXo&t=4201s) feeding integers into neural nets? one-hot encodings

Now we can't just directly feed those integer values into the NN. As we have seen before, for each neuron we have these certain x values and some weights w which are multiplied to it, so it doesn't really make sense to add directly add those integer values that we found into it.

Instead what we are going to do is to follow a method called 'One-Hot code encoding' (For our case this is a common way to encode integers).

So in One-Hot Code encoding, for example (consider the code snippet in the previous chapter) in case of 13, we basically create a vector, where the entire values are 0, except the position where 13 is which will turn to 1.

PyTorch has a 'ONE_HOT' function - [Documentation](https://pytorch.org/docs/stable/generated/torch.nn.functional.one_hot.html)
- So it takes inputs as integers in *tensor*
- And how long you want your vector to be (The length or number of elements) in *num_classes*

**IMP: When we feed inputs into Neural Nets, we don't want them to be integers, they must be floating point numbers that can take on various values.**
- By default the datatype of the vector that we create (encoded value we call it, xenc (x encoded)), in PyTorch is integer and there is no explicit mention of the dtype in the one-hot function (unlike TensorFlow where we can mention it).
- So here we make sure that we type case the dtype of the output encoded vector to float type because by default it is in integer.

&nbsp;

##### **CHAPTER** [01:13:53](https://www.youtube.com/watch?v=PaCmpygFfXo&t=4433s) the "neural net": one linear layer of neurons implemented with matrix multiplication

Here we are multiplying the input values to the weights. We are performing matrix multiplication (`@` is used for matrix multiplication in PyTorch).
`(5, 27) x (27, 27) -> (5, 27)`

We also use `rand()` while generating the weights, which actually follows [normal distribution for selecting the values within a certain range](https://www.scribbr.de/wp-content/uploads/2023/01/standard-normal-distribution-example.webp).

&nbsp;

##### **CHAPTER** [01:18:46](https://www.youtube.com/watch?v=PaCmpygFfXo&t=4726s) transforming neural net outputs into probabilities: the softmax

In this Neural Network, we have the 27 inputs, 27 weights and that's it. We are only going to be doing the w times x.
- It wont be having any bias b
- It wont be having non-linearity like tanh. We are gonna leave them as a linear layer.
- And there won't be more additional layers
It is gonna be the most simplest, *dumest* NN which is just a single linear layer.

Now **we are essentially trying to predict the probability of the next occurring character in the input.**

For the output, we are obviously trying to achieve what we did in A-Main, where (that blue matrix table) each cell had a count of the prob of the character to occur next.
- In NN, we cannot output integers. So we will be calculating the **Log Counts (a.k.a. logits)** instead and then **exponentiate** them.
- So when we exponentiate them, the negative value numbers will turn into values <1 and the positive value numbers will turn into more positive. So now we have values withing a specific range.
- Finally, for those values we normalize them to get the probability distributions (As we had done in A-main with `keepdims=True`)

Now as we tune the weights `W` we can control the probability value coming out. So the aim is to find a good `W` such that the probability distribution is pretty good and the way we measure the "pretty good" is by the loss function.

&nbsp;

##### **CHAPTER** [01:26:17](https://www.youtube.com/watch?v=PaCmpygFfXo&t=5177s) summary, preview to next steps, reference to micrograd

Did a breakdown of the entire process and Andrej also wrote this piece of code where we see the step by step breakdown of one particular word.

Even saw how we have implemented the **Softmax** Layer into this. 
```
counts = logits.exp() # counts, equivalent to N

probs = counts / counts.sum(1, keepdims=True) # probabilities for next character

# btw: these 2 lines here are together called a 'softmax'
```



