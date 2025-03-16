# LECTURE NOTES

----------

### **Set A - Intro**
----------

## Introduction

#### **Timestamp**: [00:00:00](https://www.youtube.com/watch?v=t3YJ5hKiMQ0&list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ&index=6&t=0s)

We are continuing with the implementation of MLP, we've seen how the NN takes in three inputs and predicts the fourth one with a single hidden layer in the middle (The Diagram from the paper referred in part 3).

In this, we would like to complexify that architecture where we feed a sequence of input characters instead of just three.
- Now, we won't be passing all of those sequence of characters into a single hidden layer because that will squash the information too much.
- Instead, we will be going with an approach which has like a dense number of layers and it progressively implements/processes the sequence of characters (in the form of a tree, bottom up) until it predicts the next character in the sequence.

So, as we see this architecture that we are going to complexify, we will notice that we will be arriving at something that will look very much like the architecture of a wavenet. 
- Wavenet is also a language model developed by DeepMind in 2016, but it predicts a audio sequences unlike or word level sequences.
- Looking at the architecture, they have implemented Auto Regression where they are sequentially predicting the next audio sequence and the diagram flow you would see like a deep tree like architecture.

&nbsp;

## Starter code walkthrough 

#### **Timestamp**: [00:01:40](https://www.youtube.com/watch?v=t3YJ5hKiMQ0&list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ&index=6&t=100s)

The starting section of code is very similar to the ones implemented in part 3, more importantly the API implementations of the PyTorch `torch.nn` library, where we have made similar implementations of the different Layers that can be added (Linear, BatchNorm1d etc.) - There are some changes done in these, so refer those.

What we are going to do is to improve this model now.

&nbsp;

## Let’s fix the learning rate plot

#### **Timestamp**: [00:06:56](https://www.youtube.com/watch?v=t3YJ5hKiMQ0&list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ&index=6&t=416s)

Okay so the first thing we are doing is to fix the graph that we had plotted (which also supposingly we had improved from that 'hockey stick' appearance). Turns out we are getting that appearance because the number of inputs in our batch norm layer were way too less, so its almost like its bouncing up and down between these two thresholds, so its either too correct (likely) or really wrong (unlikely),  so this creates a very thick loss function.

- So, if we look at the values in `lossi`, they are a list of float values (really long decimal point). What we have to do if to kind of calculate their average values.
*(I am not exactly sure why we are **specifically** implementing this next step of converting them into matrix rows and then finding the mean, but maybe i can come back to this in the future and have my 'aha!' moment)*
- So what we are going to do is to convert all those values in `lossi` first of all into tensors and then arrange them in the form of a matrix `torch.tensor(lossi).view(-1, 1000)`
- The `-1` is almost like a dynamic placement, so instead of us specifically mentioning the number of rows, pytorch itself checks the input values and creates them. In our case it turned out to be 200x1000 (so each row has 1000 consecutive elements). Lastly we take the mean on every row `torch.tensor(lossi).view(-1, 1000).mean(1)`. We plot that and we see a much thinner graph plot.
- In the plot we see that there is a lot of progress and suddenly a drop for a moment, which is the learning rate decay. Values after that it showed us the local minimum values of that optimization.

&nbsp;

## Pytorchifying our code: layers, containers, torch.nn, fun bugs

#### **Timestamp**: [00:09:16](https://www.youtube.com/watch?v=t3YJ5hKiMQ0&list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ&index=6&t=556s)

In this section he converts most of the codes from Part 3 into a more PyTorch implementation mimic version.

The important concepts covered here would be:
- **Embedding, Flattening** - These operations were performed in the forward pass of the NN and turns out PyTorch also have implemented such modules. Embedding for Indexing essentially and Flattening for (as the name suggests) flattening the layer.
- **Containers** - Sequential, Dict, List etc. So there is something called PyTorch Containers which have a way of organizing layers into Lists or dicts. So in particular there is something called Sequential which is basically a list of layers.

??? note
	As you might have noticed, we are basically implementing all of `torch.nn` here in these vids to see how they work under the hood.

- Lastly, there was a bug which he had encountered (root cause was from batchnorm which was in training mode(?)) which he has explained, but i didn't get it completely. I guess I will have to comeback to it once i understand and implement/practice this a lot more.

&nbsp;

### **Set B - Implementing wavenet**
----------

## Overview: WaveNet

#### **Timestamp**: [00:17:11](https://www.youtube.com/watch?v=t3YJ5hKiMQ0&list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ&index=6&t=1031s)
Same explaination as provided in the start. The structure of the wavenet being like a tree and instead of stuffing all the inputs into a hidden layer and then passing them to next ones like a sandwich (how the part MLP was implemented) we will be slowly processing them.

&nbsp;

## Dataset bump the context size to 8 and Re-running baseline code on block_size 8

#### **Timestamp**: [00:19:33](https://www.youtube.com/watch?v=t3YJ5hKiMQ0&list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ&index=6&t=1173s) to [00:19:55](https://www.youtube.com/watch?v=t3YJ5hKiMQ0&list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ&index=6&t=1195s)

In the above two timestamps, he changes the input character context from 3 to 8 and we immediately see an improvement in the final loss validation (which improved when we had increased the input context). We could go on and optimize it further but we are moving on to implement the wavenet model.

&nbsp;

## Implementing WaveNet

#### **Timestamp**: [00:21:36](https://www.youtube.com/watch?v=t3YJ5hKiMQ0&list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ&index=6&t=1296s)

Okay so essentially he spends time designing how the inputs need to be provided to the layers, he pairs them together (like how we see in the diagram) in odd and even numbers `(1, 2) (3, 4) (5, 6) (7, 8)`. Then he takes each of those two pairs and passes them into a layer.

The layer he has created in called `FlattenConsequetive` which essentially squashes the input dimensions each time it is passed through.
We have taken 8 examples to work on and 3 hidden layers (as of now, its been copy pasted three times to show a basic functionality)
```
FlattenConsecutive(2), Linear(n_embed * 2, n_hidden, bias=False), BatchNorm1d(n_hidden), Tanh()

FlattenConsecutive(2), Linear(n_hidden * 2, n_hidden, bias=False), BatchNorm1d(n_hidden), Tanh()

FlattenConsecutive(2), Linear(n_hidden * 2, n_hidden, bias=False), BatchNorm1d(n_hidden), Tanh()
```

&nbsp;

## Training the WaveNet: first pass

#### **Timestamp**: [00:37:41](https://www.youtube.com/watch?v=t3YJ5hKiMQ0&list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ&index=6&t=2261s)

He trains the above implementation, changes the values of the number of neurons in the hidden layer `n_hidden` and ultimately we get the same performance results.

&nbsp;

## Fixing batchnorm1d bug and Re-training WaveNet with bug fix

#### **Timestamp**: [00:38:50](https://www.youtube.com/watch?v=t3YJ5hKiMQ0&list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ&index=6&t=2330s) to [00:45:21](https://www.youtube.com/watch?v=t3YJ5hKiMQ0&list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ&index=6&t=2721s)
Turns out there is a bug in the batch norm implementation, as it runs but doesn't do the right thing.
The first overview that we see is that, in the original implementation of our `batchnorm` module, it takes in two dimensional inputs, but the reason it doesn't throw any errors is because broadcasting is happening perfectly (i see how powerful it can be now lol).

Now the fix is, we make it dynamic i.e. we add a set of conditions where the dimensions passed will be based on the size/input values provided. So rather than passing a fixed value, we do this.
Essentially we are treating each dimension as a batch dimension which is what we want.
Finally, we run that and we do see a *small* improvement in the final validation. But again, now we are ensuring that everything is functioning as expected.

&nbsp;

## Scaling up our WaveNet and Experimental harness

#### **Timestamp**: [00:46:07](https://www.youtube.com/watch?v=t3YJ5hKiMQ0&list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ&index=6&t=2767s) to [00:46:58](https://www.youtube.com/watch?v=t3YJ5hKiMQ0&list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ&index=6&t=2818s)

Now since everything was setup we try to increase the scale of this architecture i.e. we increase the parameter values. So we bumped up `n_embd` and `n_hidden`, keeping the rest of the architecture essentially the same. The training took quite a bit longer but our validation value became a lot lower! We finally went pass our usual barrier value that we have been seeing all along.

But it also turns out that, we could obviously experiment more with these values, for optimizing it i.e. w.r.t the hyperparameters and the learning rates and so on. That is because to perform these experimental runs is taking a lot of time, so that 'experimental harness' where we can run various experiments and tune this architecture really well, is something we are not able to do for now.

&nbsp;

### **Set C - Conclusions**
---------

## Conclusion

#### **Timestamp**: [00:51:34](https://www.youtube.com/watch?v=t3YJ5hKiMQ0&list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ&index=6&t=3094s) to [00:54:17](https://www.youtube.com/watch?v=t3YJ5hKiMQ0&list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ&index=6&t=3257s)
By far my most favorite section of the series, perfectly summarizes everything we have done so far and what to actually expect in the upcoming lectures. We have officially 'unlocked a new skill' to actually implement NN training by completely using PyTorch. Going ahead with RNN, Transformers etc. 

So if you have made it till here as well, YAY! Now on to the next one :)