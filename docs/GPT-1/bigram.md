
Following is a breakdown of the ***[bigram.py](https://github.com/MuzzammilShah/NeuralNetworks-TransformerModel-1/blob/main/bigram.py)*** script added in the implementation repository.

----------

## 1. Initialisation

```
import torch
import torch.nn as nn
from torch.nn import functional as F

# hyperparameters
batch_size = 32 # how many independent sequences will we process in parallel?
block_size = 8 # what is the maximum context length for predictions?
max_iters = 3000
eval_interval = 300
learning_rate = 1e-2
device = 'cuda' if torch.cuda.is_available() else 'cpu'
eval_iters = 200

torch.manual_seed(1337)

with open('cleaned_dataset.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# here are all the unique characters that occur in this text
chars = sorted(list(set(text)))
vocab_size = len(chars)
# create a mapping from characters to integers
stoi = { ch:i for i,ch in enumerate(chars) }
itos = { i:ch for i,ch in enumerate(chars) }
encode = lambda s: [stoi[c] for c in s] # encoder: take a string, output a list of integers
decode = lambda l: ''.join([itos[i] for i in l]) # decoder: take a list of integers, output a string

# Train and test splits
data = torch.tensor(encode(text), dtype=torch.long)
n = int(0.9*len(data)) # first 90% will be train, rest val
train_data = data[:n]
val_data = data[n:]

# data loading
def get_batch(split):
    # generate a small batch of data of inputs x and targets y
    data = train_data if split == 'train' else val_data
    ix = torch.randint(len(data) - block_size, (batch_size,))
    x = torch.stack([data[i:i+block_size] for i in ix])
    y = torch.stack([data[i+1:i+block_size+1] for i in ix])
    x, y = x.to(device), y.to(device)
    return x, y
```
**Breaking it down:**

The above codes have the same explaination as in the notebook combined together. Preparation of the dataset, splitting them into train and val. Finally loading batches of data.

&nbsp;

## 2. `estimate_loss()` Function

```
@torch.no_grad()
def estimate_loss():
    out = {}
    model.eval()
    for split in ['train', 'val']:
        losses = torch.zeros(eval_iters)
        for k in range(eval_iters):
            X, Y = get_batch(split)
            logits, loss = model(X, Y)
            losses[k] = loss.item()
        out[split] = losses.mean()
    model.train()
    return out
```
**Breaking it down:**

- `@torch.no_grad()`: This decorator disables gradient tracking, which saves memory and speeds up evaluation (since gradients (grads) are not needed during evaluation).
- `model.eval()`: Puts the model in evaluation mode (disables dropout, batch norm, etc.).
- `for split in ['train', 'val']`: We compute loss separately for training and validation datasets.
- `losses = torch.zeros(eval_iters)`: We will store `eval_iters` number of loss values in this tensor.
- Looping over `eval_iters` times:
    - `X, Y = get_batch(split)`: Get a batch of training or validation data.
    - `logits, loss = model(X, Y)`: Compute predictions and loss.
    - `losses[k] = loss.item()`: Store the loss in the tensor.
- `out[split] = losses.mean()`: Compute the average loss across `eval_iters` runs for more stable estimates.
- `model.train()`: Switch back to training mode.
- `return out`: Returns a dictionary with average training and validation loss.

&nbsp;

## 3. `BigramLanguageModel` Class

This is the core model for the character-level bigram model.
```
class BigramLanguageModel(nn.Module):

    def __init__(self, vocab_size):
        super().__init__()
        # each token directly reads off the logits for the next token from a lookup table
        self.token_embedding_table = nn.Embedding(vocab_size, vocab_size)
```
**Breaking it down:**

- `nn.Module`: Parent class for all PyTorch models.
- `nn.Embedding(vocab_size, vocab_size)`:
    - A lookup table that maps each character (index) to a learnable vector of size `vocab_size`.
    - The model simply learns a direct mapping from each character to the probabilities of the next character.

&nbsp;

## 4. `forward()` Method

```
def forward(self, idx, targets=None):
    logits = self.token_embedding_table(idx) # (B,T,C)

    if targets is None:
        loss = None
    else:
        B, T, C = logits.shape
        logits = logits.view(B*T, C)
        targets = targets.view(B*T)
        loss = F.cross_entropy(logits, targets)

    return logits, loss
```
**Breaking it down:**

- Inputs:
    - `idx`: A tensor of shape `(B, T)`, where `B` is batch size and `T` is sequence length.
    - `targets`: Ground truth next characters (if provided).

- Steps:
    - Look up embeddings:
        - `logits = self.token_embedding_table(idx)` → Shape `(B, T, C)`, where `C = vocab_size` (one row for each token).
    - Compute loss (if targets exist):
        - Reshape `logits` and `targets` to be `(B*T, C)` and `(B*T)`, respectively.
        - Compute `F.cross_entropy(logits, targets)`, which measures how well the predicted character distribution matches the true character.
    - Return:
        - `logits`: The raw scores for the next token.
        - `loss`: The loss value (if `targets` were provided).

&nbsp;

## 5. `generate()` Method

```
def generate(self, idx, max_new_tokens):
    for _ in range(max_new_tokens):
        logits, loss = self(idx)
        logits = logits[:, -1, :] # Focus on last time step
        probs = F.softmax(logits, dim=-1) # Convert to probabilities
        idx_next = torch.multinomial(probs, num_samples=1) # Sample next token
        idx = torch.cat((idx, idx_next), dim=1) # Append to sequence
    return idx
```
**Breaking it Down:**

- Inputs:
    - `idx`: A tensor of shape `(B, T)`, representing the input sequence.
    - `max_new_tokens`: The number of tokens to generate.

- Steps:
    - Loop for `max_new_tokens` iterations:
    - Compute `logits, loss = self(idx)`, which gets predictions for the next character.
    - Extract only the last token's logits: `logits = logits[:, -1, :]`.
    - Apply `softmax` to get probabilities.
    - Use `torch.multinomial(probs, num_samples=1)` to sample a token based on probabilities.
    - Append `idx_next` to the sequence.
    - Return the final sequence.

&nbsp;

## 6. Training Loop

```
model = BigramLanguageModel(vocab_size)
m = model.to(device)

# create a PyTorch optimizer
optimizer = torch.optim.AdamW(model.parameters(), lr=learning_rate)

for iter in range(max_iters):

    # every once in a while evaluate the loss on train and val sets
    if iter % eval_interval == 0:
        losses = estimate_loss()
        print(f"step {iter}: train loss {losses['train']:.4f}, val loss {losses['val']:.4f}")

    # sample a batch of data
    xb, yb = get_batch('train')

    # evaluate the loss
    logits, loss = model(xb, yb)
    optimizer.zero_grad(set_to_none=True)
    loss.backward()
    optimizer.step()
```
**Breaking it Down:**

- Model initialization: `model = BigramLanguageModel(vocab_size)`, then moved to `device`.
- Optimizer: `AdamW` optimizer is used to update model parameters.
- Training Loop:
    - Evaluate loss every `eval_interval` iterations
        - Calls `estimate_loss()`.
    - Get a batch of training data:
        - `xb, yb = get_batch('train')`.
    - Compute loss:
        - `logits, loss = model(xb, yb)`.
    - Backpropagation:
        - `optimizer.zero_grad(set_to_none=True)`: Clears gradients.
        - `loss.backward()`: Computes gradients.
        - `optimizer.step()`: Updates model weights.

&nbsp;

## 7. Generating text

```
# generate from the model
context = torch.zeros((1, 1), dtype=torch.long, device=device)
print(decode(m.generate(context, max_new_tokens=500)[0].tolist()))
```
**Breaking it Down:**

- `context = torch.zeros((1, 1), dtype=torch.long, device=device)`:
    A single-token input (typically the start-of-sequence).
- `m.generate(context, max_new_tokens=500)`:
    Generates 500 tokens from the model.
- `decode(...)`:
    Converts the generated token sequence back into text.

&nbsp;

----------

## Final Thoughts
- This is a simple character-level bigram model, meaning each character prediction is based only on the previous character.
- The `nn.Embedding` layer learns to associate each character with a probability distribution over possible next characters.
- The model is trained using cross-entropy loss.
- The `generate()` function samples new characters based on learned probabilities.