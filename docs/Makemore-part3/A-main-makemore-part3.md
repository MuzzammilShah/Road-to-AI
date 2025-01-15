# SET A - LECTURE NOTES

----------

## Introduction

#### **Timestamp**: [00:00:00](https://www.youtube.com/watch?v=P6sfmUTpUmc&t=0s)

We'll be continuing with our implementation of Makemore. Now, we'll obviously like to move forward from the previous implementation to slightly more advanced implementations like RNN, GRU, Transformer etc. 

But we will be sticking around with MLP itself right now. The purpose of this is to have an intuitive understanding of the activations in the NN during training and especially the gradients that are falling backwards - how they behave and what they look like.

So it is going to be very important to understand the history of the development of these architectures (RNN, GRU etc.). The reason is, RNN while they are very expressive, is the universal approximator and in principle can implement all the algorithms; we will see that they are not very easily optimizable with the first order gradient techniques we have available to us and that we use all the time.

And the key to understanding why they are not optimizable so easily, is to understand the activations, the gradients and how they behave during training (And apparently it is also seen that all the variants after RNN have tried to improve that situation).

So that is what we will be focusing on.

&nbsp;

## Starter code 

#### **Timestamp:** [00:01:22](https://www.youtube.com/watch?v=P6sfmUTpUmc&t=82s) 

Cleaned up code from Makemore Part 2 with some fixes. Will be starting from there, provided a starter code along with revision explanations, so go through that. You can find the code [here](executed-starter-code.ipynb)

&nbsp;

## Fixing the initial loss 

#### **Timestamp:** [00:04:19](https://www.youtube.com/watch?v=P6sfmUTpUmc&t=259s) 

Now the first thing we would like to point out is the initialization. We can tell that there is multiple things that is wrong with our neural network especially at initialization, but lets start with the first one.

In the zeroth iteration, our loss value is way too high. And as it moves to the next iteration the loss value comes down even more significantly. Now, usually during the training of the neural net we can almost always expect what our initial loss/loss value is going to be. And we can also calculate it in our case:

At the start we basically expect it to record a constant/standard normal distribution as there can be only one possibility from 27 characters. So we consider that and then take the negative log likelihood `-torch.tensor(1/27.0).log()` 
Then we can see that the loss value is a lot lower and is what we expect.

Why this is happening is because, at the start the model/NN is 'confidently wrong'. So for some it records very high confidence and for some very low confidence.

So how do we resolve this,
we notice that the logits for the zeroth iteration are very high and we need them to be close to zero.
and logits are calculated based on `logits = h @ W2 + b2`
So we try to multiply the W2 and b2 values with values very close to zero.

We added the values 0.01 and 0 to the W2 and b2 values (avoid adding 0 directly, although for this example multiplying it with 0 to the output layer might just be fine, but don't normally do it)

So we finally see that, the initial loss value has been controlled and the graph output doesn't have that 'hockey stick' appearance. And the Train evaluation value was also reduced from 2.12 to 2.06

This happened because we actually spent time optimizing the NN rather than just spending the initial several thousand iterations just squashing the weights and then optimizing it. 

So that was the Number 1 issue fix.

&nbsp;

## Fixing the saturated tanh 

#### **Timestamp:** [00:12:59](https://www.youtube.com/watch?v=P6sfmUTpUmc&t=779s) 

??? note
	This section will contain different code snippets which won't be present in the final implementation notebook, That is because these were used for just explaination purposes. For better understanding, copy the snippets, add it to the code to see how the outputs will turn out.

Now, lets look at the Second problem. Although we were able to fix the initial loss there is still another problem lingering within this neural net. 

We have fixed the logits values, the problem now is with the `h` values - the activations of the hidden states.
Lets see how the value distributions are for the activation function, you can depict those using a histogram:

```
plt.hist(h.view(-1).tolist(), 50)
```

```
plt.hist(hpreact.view(-1).tolist(), 50)
```

In the first code you would see that the values would be active at 1 and -1 (tanh is being a play here) and in the second code, if we look at the 'h pre activation' values `hpreact` that we feed into the tanh, the distribution of the preactivations is very very broad.

*Now this may not really look like an issue and that is coz we are (I am) still a beginner in Neural Nets :)* So, Watch these sections of the timestamps for a better visual understanding of the issue:

- [15:16](https://youtu.be/P6sfmUTpUmc?si=juvbk3pYS3cyCEC0&t=916) to 18:20 : Diving into the backpropagation process, especially in the tanh layer. He dives into what happens in tanh during the backward pass. So the concern here is that, if all of the outputs of `h` are in the flat regions of -1 and 1, then the gradients that are just flowing though the network would just get destroyed.

 - [18:21](https://youtu.be/P6sfmUTpUmc?si=2wtrd2nHF8axm5C3&t=1101) to 20:35: A figure has been generated to see how much of the `h` values have been flattened in the tanh layer. It is a boolean expression graph, where if the condition is true it will be represented in white dots.
	 ```
	 plt.figure(figsize=(20,10))
	 plt.imshow(h.abs() > 0.99, cmap='gray', interpolation='nearest')
	 ```
	Now, if there was a column that was completely whites, then we have something what we call the 'dead neuron'. It means it never fell within the active part of the tanh i.e. the curve area between -1 and 1. And if any of the values fall in the flat regions (end points) i.e. at the -1 and 1, then that means the neuron will never learn and it is a dead neuron (so now you know why it was an issue there :) )

- [20:36](https://youtu.be/P6sfmUTpUmc?si=SdmX7xbbV6rbOtl1&t=1236) to 23:23 : Behaviors of different types of Activation functions.

- [23:24](https://youtu.be/P6sfmUTpUmc?si=SdmX7xbbV6rbOtl1&t=1236) to 25:53: Back to the black and white figure graph where we take the measures to resolve the issue of dead neurons.
	So now, `hpreact` comes from `embcat` which comes from `C[Xb]` so these are uniform Gaussian, which are then multiplied and added with the weights and bias.
	The `hpreact` values is right now way off zero and we want its values to be closer to zero. So therefore like how we did with logits, we modify the values of the W1 and b1 during the NN values initialization.
	We have multiplied those values with values close to zero like `0.01` for b1 and `0.1` for W1, and we noticed that there are no values in the flat regions of the tanh layer therefore no white spots which is great. For example purposes, we increase the values for W1 by multiplying it with `0.2` instead so that we can see some white spots.

??? note
	Use the code snippets provided within this lecture timestamp.

So now we have improved the loss value a lot further. This is basically illustrating initialization and its impact on performance, just by being aware of the internals of the NN of its activations and gradients.

Lastly, the purpose of those 2 explanations is that, right now we are only working with a single MLP. Now as we get a bigger NN and there are more depths into the neurons, these initializations errors can cause us a lot of problems and we may even come to a case where the NN doesn't train at all. So we must be very aware of this.

&nbsp;

## Calculating the init scale: “Kaiming init” 

#### **Timestamp:** [00:27:53](https://www.youtube.com/watch?v=P6sfmUTpUmc&t=1673s) 

In our code till now, during the initialization of the Neural Network, we have been hardcoding the value/adding magic numbers to optimize the initial value. But we need to ensure that we follow a more dynamic approach.
```
g = torch.Generator().manual_seed(2147483647)
C  = torch.randn((vocab_size, n_embd),            generator=g)
W1 = torch.randn((n_embd * block_size, n_hidden), generator=g) * 0.2 #here
b1 = torch.randn(n_hidden,                        generator=g) * 0.01
W2 = torch.randn((n_hidden, vocab_size),          generator=g) * 0.01
b2 = torch.randn(vocab_size,                      generator=g) * 0
```

Upto 35:56 we have covered as to why that needs to be done (How activation function actually squash the values and how optimizing the initial values helps with the help of histogram) along with that we were also shown a [research paper](https://arxiv.org/pdf/1502.01852) by Kaiming He which illustrates how we can perform such calculation of numbers during initialization. 

So in the paper he suggests to do a square root of 2/fin (fin is the input value). The square root of fin is there, the 2 was added because in their paper they considered ReLU as the activation function, so in that the values get squashed to half and then optimised. So in order to balance that they added 2 -> `√2/nl`

Now, this kaiming implementation is also done in [PyTorch called 'Kaiming normal'](https://pytorch.org/docs/stable/nn.init.html#torch.nn.init.kaiming_normal_) which can be used as well.

??? note
	Go through till that part of the timestamp for a getting a more intuitive understanding, it was more of an explanation backup to show why we are doing what we are doing in the next steps.

From [35:57](https://youtu.be/P6sfmUTpUmc?si=jhlIF3fUDsZBw-MU&t=2157):
Now, back then when the above paper was released about 7 years ago, we had to be very careful about how we initialize the values for these input values of the NN. But now we have more modern innovations that handle this way better, which include:
- Residual Connection (Which we will cover in later videos)
- Use of different Normalization layers- Batch Normalization. Layer Normalization, Group Normalization
- Much better Optimizers- Not just stochastic gradient descent the simple optimizer that we have bee using here, but slightly more complex optimizers like RMS prop and Adam(Adaptive Moment Estimation).
So all these modern innovations make it much less necessary for us to precisely calculate the initialization of the neural net.

The method which Andrej uses is dividing the initial value with the square root of the fin.

As for our code in this, we will be doing the "Kaiming init" itself, provided by PyTorch. Now they have also mentioned a certain gain value which must be added on the numerator depending on the activation function used, [as mentioned here](https://pytorch.org/docs/stable/nn.init.html#torch.nn.init.calculate_gain). So in our case its tanh, so we use `5/3`, divide with the square root of the fin. So finally that would be:
`W1 = torch.randn((n_embd * block_size, n_hidden), generator=g) * (5/3) / ((n_embd * block_size)**0.5)`
instead of directly multiplying with a magic number which we predicted from looking at the histogram graphs.

This approach is a lot better and will help us as we scale our NN and becomes much larger.

&nbsp;

## Batch normalization 

#### **Timestamp:** [00:40:40](https://www.youtube.com/watch?v=P6sfmUTpUmc&t=2440s) 

Showed the paper which actually introduced the concept of batch normalization, researched by a team at google - [Research paper](https://arxiv.org/pdf/1502.03167) and the idea of the concept which it explained.

From [42:16](https://youtu.be/P6sfmUTpUmc?si=zQKb_RmYEtbIcJnl&t=2536) -> Implemented the batch normalization step into the code (How and what needs to be done based on the paper)

We will work on the pre-activation value `hpreact` just before they enter the tanh layer. These are already almost gaussian (because 1. if it is too small then tanh will have no effect on it and if it is too large then tanh will become to saturated, 2. this is just a single layer NN, but as it gets complex this is where we will be adding it)

Now, we will be considering one batch, in this case the 0th column and calculate its mean and standard deviation.
```
hpreact.mean(0, keepdim=True).shape
```

```
hpreact.std(0, keepdim=True).shape
```

Now we perform the batch normalization on `hpreact` and make the values roughly gaussian.
```
hpreact = (hpreact - hpreact.mean(0, keepdim=True)) / (hpreact.std(0, keepdim=True))
```
So we subtract with the mean and divide with its standard deviation.

Now, if we train the NN after doing this, we wont exactly get a good loss value. First of all, we don't want it to force it to be gaussian for all values, we need it just for the first value. Apart from that, we want it to spread around so that the values fed into the tanh has mixed reactions - some of them would trigger it, some may saturate it. 

So we introduce another concept from the paper called 'Scale and Shift'
What we do is, take the normalized input and we are scaling it with some **gain** and offsetting with some **bias**, to get our final output from the layer (See page 2, right bottom box in the batch norm paper)

Now we add those values
```
bngain = torch.ones((1, n_hidden))
```

```
bnbias = torch.zeros((1, n_hidden))
```

So we add these to the batch norm layer
```
hpreact = bngain * (hpreact - hpreact.mean(0, keepdim=True)) / (hpreact.std(0, keepdim=True)) + bnbias
```
Exactly as in the paper, multiply the gain value and add the bias.

Then, we add them to the parameters of the NN as they will be trained during backpropagation.
`parameters = [C, W1, b1, W2, b2]` to `parameters = [C, W1, b1, W2, b2, bngain, bnbias]`

(We add that batch norm layer^ for the validation set of code as well)

In bigger NN, we usually recognize the single layer or the convolution layers and add the batch norm just after this to control the scale of these activations at every point of this NN. So it significantly stabilizes the training and that is why they are so popular.

From [50:15](https://youtu.be/P6sfmUTpUmc?si=1mEMNcSCfctjXnxW&t=3015) to 53:48 -> The Story of Batch Normalization of how it acts as a regulariser, so it works for some training(very few cases) and how many people are trying to move away from it to other normalization techniques.

From [54:04](https://youtu.be/P6sfmUTpUmc?si=Z-zzIOkOSAQW8OsD&t=3244) -> 
Modifications to the code (the validation part), where it can handle cases where if only a single input is fed (as now it expects values in batches) -> after that update again to make sure it is in a loop

- So in order to fix that, we have calculated the mean and standard deviation, so they are now fixed values of the tensors which are now passed:

```
# calibrate the batch norm at the end of training

with torch.no_grad():
  # pass the training set through
  emb = C[Xtr]
  embcat = emb.view(emb.shape[0], -1)
  hpreact = embcat @ W1 # + b1
  # measure the mean/std over the entire training set
  bnmean = hpreact.mean(0, keepdim=True)
  bnstd = hpreact.std(0, keepdim=True)
```

```
@torch.no_grad()
def split_loss(split):

  x,y = {
    'train': (Xtr, Ytr),
    'val': (Xdev, Ydev),
    'test': (Xte, Yte),
  }[split]
  
  emb = C[x] # (N, block_size, n_embd)
  embcat = emb.view(emb.shape[0], -1)
  hpreact = embcat @ W1 + b1
  hpreact = bngain * (hpreact - hpreact.mean(0, keepdim=True)) / (hpreact.std(0, keepdim=True)) + bnbias #this is removed
  hpreact = bngain * (hpreact - bnmean) / bnstd + bnbias #and updated to this
  h = torch.tanh(hpreact) 
  logits = h @ W2 + b2
  loss = F.cross_entropy(logits, y)
  print(split, loss.item())

split_loss('train')
split_loss('val')
```

- Contd from [56:24](https://youtu.be/P6sfmUTpUmc?si=T30lB2x6Y6GCh6VG&t=3358)till 59:58 (Recommend to watch this part of the timestamp again) Now nobody wants to estimate the mean and standard deviation in the second stage i.e. having made a neural net. So the paper itself provides another method (the mean and std idea was received from the paper as well), where we add like a running state. So the moment the first stage of making NN is done, it automatically comes to this. 

	So instead of adding this in the validation part of the code, we are going to add this in the training time itself. That way we are kind of creating this side job which does this work simultaneously for both training and val sets and we don't need that new block of code which we had added^

```
# BatchNorm parameters
bngain = torch.ones((1, n_hidden))
bnbias = torch.zeros((1, n_hidden))
bnmean_running = torch.zeros((1, n_hidden))
bnstd_running = torch.ones((1, n_hidden))

parameters = [C, W1, W2, b2, bngain, bnbias]
```

```
# BatchNorm layer
bnmeani = hpreact.mean(0, keepdim=True)
bnstdi = hpreact.std(0, keepdim=True)
  
hpreact = bngain * (hpreact - bnmeani) / bnstdi + bnbias
  
with torch.no_grad():
	bnmean_running = 0.999 * bnmean_running + 0.001 * bnmeani
	bnstd_running = 0.999 * bnstd_running + 0.001 * bnstdi
```

So if you run `bnmean` and `bnmean_running` | `bnstd` and `bnstd_running` (haven't removed the new code which we added before the val code chunk yet) you would see that they are very similar, not identical but similar.

From [1:00:55](https://youtu.be/P6sfmUTpUmc?si=8Qm1HWAj77cIMKAR&t=3655)-> 2 more notes:
1. In the paper, in the box explanation with the formulas, under `//normalise` we see an epsilon (ϵ), that in added there so that it essentially avoids a divide by zero. We haven't done that in our code because it won't really be necessary as our example is too small.
2. The `b1` that we add in the `hpreact` is pretty useless right now. Because in the batch norm we are already adding the bias `bnbias` and also before that subtracting the value of `hpreact` with `bnmean`. So essentially, in batch norm we are adding our own bias. *So during the first addition of weights in the NN and if you are performing Batch norm, you don't have to add the bias, so you can just comment it out* (Its not really having a catastrophic effect if you keep it, but we know its not really doing anything in our code so we just drop it).

&nbsp;

## Batch normalization: summary 

#### **Timestamp:** [01:03:07](https://www.youtube.com/watch?v=P6sfmUTpUmc&t=3787s) 

(Useful for a quick yet detailed recap)

- We are using batch normalization to control the statistics of activations in the neural net.
- It is common to sprinkle the batch normalization layer across the neural net, and usually we place it after layers that have multiplications. Like a linear layer or Convolutional layer.
- From [1:03:33](https://youtu.be/P6sfmUTpUmc?si=KhnrWq9AZcLFsQRg&t=3813) -> Explanation of the different variables in the code.

	- Batch norm internally has parameters for the gain and the bias, that are trained using backpropagation.
	```
	bngain = torch.ones((1, n_hidden))
	bnbias = torch.zeros((1, n_hidden))
	```
	
	- It also has two buffers: running mean and running std.
	```
	bnmean_running = torch.zeros((1, n_hidden))
	bnstd_running = torch.ones((1, n_hidden))
	```
	These are not trained using backpropagation, these are trained using the update (janky update as sensei calls is, the one we made)
	```
	with torch.no_grad():
	    bnmean_running = 0.999 * bnmean_running + 0.001 * bnmeani
	    bnstd_running = 0.999 * bnstd_running + 0.001 * bnstdi
	```
	
	- (i) These (above 2 points) are the parameters which calculate the mean and std of the activations, that are fed into the batch norm layer, over that batch -> (ii) Then it is centering that batch to be unit gaussian and then it is offsetting and scaling it by the learned bias and gain -> (iii) On top of that it is keeping track of the mean and std inputs and is maintaining the running mean and standard deviation (this will later be used as an inference so that we don't have to re-estimate the mean and std i.e. `bnmeani` and `bnstdi` all the time) and this allows us to basically forwards individual examples at test time.
	```
	  #----------------
	  # BatchNorm layer
	  #----------------
	  bnmeani = hpreact.mean(0, keepdim=True) #(i)
	  bnstdi = hpreact.std(0, keepdim=True) #(i)
	  hpreact = bngain * (hpreact - bnmeani) / bnstdi + bnbias #(ii)
	  with torch.no_grad(): #(iii)
	    bnmean_running = 0.999 * bnmean_running + 0.001 * bnmeani #(iii)
	    bnstd_running = 0.999 * bnstd_running + 0.001 * bnstdi #(iii)
	  #----------------
	```

( yes this is fairly a complicated layer, but this is what it is doing internally :) )

&nbsp;

## Real example: resnet50 walkthrough 

#### **Timestamp:** [01:04:50](https://www.youtube.com/watch?v=P6sfmUTpUmc&t=3890s) 

RESNET: Residual Neural Network commonly used for image classification.
Comparison of how the methodology implemented by us is almost similar to that in resnet implementation.

From [1:11:20](https://youtu.be/P6sfmUTpUmc?si=guGsXV9IrWMdRkvX&t=4280) -> The comparison of batch norm: our implementation and in PyTorch.
See [PyTorch Documentation](https://pytorch.org/docs/stable/generated/torch.nn.BatchNorm1d.html#batchnorm1d)

&nbsp;

## Summary of the lecture 

#### **Timestamp:** [01:14:10](https://www.youtube.com/watch?v=P6sfmUTpUmc&t=4450s) 

Overall revision and finally with a note of advise to not use batch norm as there are many better normalization techniques available now.


## Additional Summary

#### **Timestamp** [01:18:35](https://www.youtube.com/watch?v=P6sfmUTpUmc&t=4715s) to [01:51:34](https://www.youtube.com/watch?v=P6sfmUTpUmc&t=6694s) :

!!! info
	He does a quick summary explanations of all the different sections of the codes. It will be a lot easier to follow from the video, here are the timestamps:

	- [01:18:35](https://www.youtube.com/watch?v=P6sfmUTpUmc&t=4715s) just kidding: part2: PyTorch-ifying the code 
	- [01:26:51](https://www.youtube.com/watch?v=P6sfmUTpUmc&t=5211s) viz #1: forward pass activations statistics 
	- [01:30:54](https://www.youtube.com/watch?v=P6sfmUTpUmc&t=5454s) viz #2: backward pass gradient statistics 
	- [01:32:07](https://www.youtube.com/watch?v=P6sfmUTpUmc&t=5527s) the fully linear case of no non-linearities 
	- [01:36:15](https://www.youtube.com/watch?v=P6sfmUTpUmc&t=5775s) viz #3: parameter activation and gradient statistics 
	- [01:39:55](https://www.youtube.com/watch?v=P6sfmUTpUmc&t=5995s) viz #4: update:data ratio over time 
	- [01:46:04](https://www.youtube.com/watch?v=P6sfmUTpUmc&t=6364s) bringing back batchnorm, looking at the visualizations 
	- [01:51:34](https://www.youtube.com/watch?v=P6sfmUTpUmc&t=6694s) summary of the lecture for real this time

	Also, it was supposed to be a quick summary of what all we have done, as for those visualization graph, some may have been a little challenging to understand, but we will get into its depth in the next upcoming videos. So keep learning!

**The main 3 points discussed:**

1. Introduction to Batch Norm, one of the first modern methods that were introduced to help stabilize training deep neural networks. How it works and How it will be used in a Neural Network.

2. PyTorch-ifying the code and writing it into modules/layers/classes -> Linear, BatchNorm1d and tanh. These can be stacked up into neural nets like building blocks. So if you import `torch.nn` it will work here as well as the API calls are similar.

3. Introducing the dynamic tools that are used to understand if the neural network is in a good state dynamically.
	So we are looking at the statistics, histogram and activation of- *(graph 1)* the Forward pass activations, *(graph 2)* the Backward pass gradients and *(graph 3)* the ways it is going to get updated as part of the stochastic gradient descent (so we look at the mean, std and the ratio of the gradients to data) and *(graph 4)* finally the updates to the data (the final graph where we just compare it based on how it changes over time).

Now, there are a lot things that haven't been explained as well. Right now we are actually getting to the cutting edge of where the field actually is. We certainly still haven't solved Initialization, Backpropagation - it's still under research but we are making progress and we have tools which are telling us if things are on the right track or not.

----------