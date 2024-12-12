# SET C - LECTURE NOTES

----------

## Splitting up the dataset into train/val/test splits and why

#### **Timestamp**: [00:53:20](https://www.youtube.com/watch?v=TCH_1BHY58I&t=3200s) 

Now, in our case the model isn't very large (our number of parameters is like upto 3481). These models can get larger and larger as we add more parameters and neurons. So as the capacity of the neural net grows, it becomes more and more capable of overfitting the training set. 
So we wont be able to generate new data and we can check that by seeing the loss on any withheld data from training, there the loss value would be too high, so its not a very good value.

Therefore, one standard that is been followed is to splitting up the dataset into 3: Training (80%), Dev/Validation (10%) and Test splits (10%)

Training set: Used for Optimizing the parameters of the model, using gradient descent (like how we've done so far). Therefore, this is **used to train the parameters**

Dev/Validation: Used for Development, over all the hyperparameters of the model. Hyperparameters for example would be the size of the hidden layer or the size of the embedding (the first layer).Therefore, this is **used to train the hyperparameters**

Test set: This is used to check/evaluating the performance of the model at the end. 
Now, you are only allowed to check the loss on the test set only a few times. As each time you learn something, it is used to train in the train set. So, if you do it too much, you risk overfitting the model.

&nbsp;

## Experiment: larger hidden layer

#### **Timestamp**: [01:00:49](https://www.youtube.com/watch?v=TCH_1BHY58I&t=3649s) 

In order to improve the performance of the model, we increase the size of the hidden layer. 
But we notice that the loss doesn't improve by that much immediately (after a few iterations as well), now there maybe various reasons to it: The increase size of the hidden layer may take sometime to converge during training or the Batch size (32 in our case) maybe too low or the input embeddings maybe too small (right now its size if 2 dimensional, so we maybe cramping in too much data in too less space).

So in the code, we first increased the size of the tanh (hidden layer) and then ran the model again. This time there was only a tiny difference between the dev and training loss (We keep re-running the model, twice).

&nbsp;

## Visualizing the character embeddings

#### **Timestamp**: [01:05:27](https://www.youtube.com/watch?v=TCH_1BHY58I&t=3927s) 

so we made a visualization of how our embeddings look like right now (sensei provided the code obviously), since they are only 2 dimensional we could plot how the individual characters are plotted out. The results looked way different than that of sensei's but mine was a lot more group? But my loss value had been low from the start so lets see.

Next we'll increase the embedding size to see if it reduces the loss value.

&nbsp;

## Experiment: larger embedding size

#### **Timestamp**: [01:07:16](https://www.youtube.com/watch?v=TCH_1BHY58I&t=4036s) 

We'll be changing a couple of values here (For `C` 2 will be changed to 10 (so x5 times) so for `W1` 6 will be changed to 30), and in the rest of the codes as well (Normally we wouldn't hard code this value, but in our example we're doing this - as we are still learning).

Okay so we got these values after increasing the embedding size:
dev: `tensor(2.2085, grad_fn=<NllLossBackward0>)`
training: `tensor(2.1633, grad_fn=<NllLossBackward0>)`

After doing a loss decay:
dev: `tensor(2.1091, grad_fn=<NllLossBackward0>)`
training: `tensor(2.0482, grad_fn=<NllLossBackward0>)`

So we are indeed decreasing the loss a little bit and we got a lower value than we did before we started all these steps! (Ending of B-main, previous notes which was about `2.3` if I'm not wrong)

Useful note: [1:10:43](https://youtu.be/TCH_1BHY58I?si=qiNyk90u5FI3ECgp) to 1:11:01 -> On how you consider a certain loss value before adding it officially to a research paper.

&nbsp;

## Summary of our final code, conclusion

#### **Timestamp**: [01:11:46](https://www.youtube.com/watch?v=TCH_1BHY58I&t=4306s) 

Updated in the notebook:
- Not much changes to what we have done so far, but just some code improvement for the lr value to change based on the iterations.
- Here basically we are open to experimenting with different values, whether it is the inputs, size of the layers or the loss rate values to see how we can decrease the final loss value.
- Ran for about 1 minute 55.5 seconds! (Longest so far lol)

I think the loss values were decent: dev `2.1294`, train `2.1677`

&nbsp;

## Sampling from the model

#### **Timestamp**: [01:13:24](https://www.youtube.com/watch?v=TCH_1BHY58I&t=4404s) 

```
# sample from the model
g = torch.Generator().manual_seed(2147483647 + 10)

for _ in range(20):
    
    out = []
    context = [0] * block_size # initialize with all ...
    while True:
      emb = C[torch.tensor([context])] # (1,block_size,d)
      h = torch.tanh(emb.view(1, -1) @ W1 + b1)
      logits = h @ W2 + b2
      probs = F.softmax(logits, dim=1)
      ix = torch.multinomial(probs, num_samples=1, generator=g).item()
      context = context[1:] + [ix]
      out.append(ix)
      if ix == 0:
        break
    
    print(''.join(itos[i] for i in out))
```

We are going to be working with with 20 samples
`for _ in range(20)`

First we begin with all dots (...) so that's the context
`context = [0] * block_size`

So the `while` loop goes on until we generate the 0th character `ix == 0`

Inside the loop,

First we are embedding the context in the embedding table `C` and here the first dimension is the size of the training set, but here we are considering only one example for simplicity
`emb = C[torch.tensor([context])] # (1,block_size,d)`

That value gets projected into `h` then we calculate the `logits` and then the probability.

For `probs` we are using softmax, we add that to logits, so that basically exponentiates the logits and makes them sum to 1. So similar to cross-entropy, softmax is careful that there is no overflows.

Then we sample them by using `torch.multinomial`, `ix = torch.multinomial(probs, num_samples=1, generator=g).item()` to get our next index.

Then we shift the context window to append the index
```
context = context[1:] + [ix]
      out.append(ix)
```

And then finally we decode all the integers to strings and print them out
`print(''.join(itos[i] for i in out))`

--------
