
Example
```
from micrograd.engine import Value

a = Value(-4.0)
b = Value(2.0)
c = a + b
d = a * b + b**3
c += c + 1
c += 1 + c + (-a)
d += d * 2 + (b + a).relu()
d += 3 * d + (b - a).relu()
e = c - d
f = e**2
g = f / 2.0
g += 10.0 / f
print(f'{g.data:.4f}') # prints 24.7041, the outcome of this forward pass
g.backward()
print(f'{a.grad:.4f}') # prints 138.8338, i.e. the numerical value of dg/da
print(f'{b.grad:.4f}') # prints 645.5773, i.e. the numerical value of dg/db
```

Here what we are doing is we have an expression that we are building, so we have two inputs 'a' and 'b'.

They are -4 and 2. 

They are wrapped in this 'Value' object, that we are going to build as part of this Micrograd library.

Now, those Value objects are going to wrap up those numbers themselves and we are going to build up the mathematical expressions that you see after that. So, a & b eventually get transformed to c, d, e, f and then g.

So, we are showing the functionality of Micrograd in some of the operations that it supports like: Adding, Multiplying, Raising them to a constant power etc.

**Therefore, we are building an expression graph {Hidden Layer} -> with these two values 'a' and 'b' as an input {Input Layer} -> producing an output of 'g' {Output Layer}**

**So micrograd in the background will create that entire mathematical expression (from c to f) {Therefore acts as that Hidden Layer}**


Apart from just doing a Forward Pass, i.e. finding g.

We are also going to perform Backpropagation where we find the derivative of g by going backwards from output -> hidden -> input by recursively applying chain of rule (from calculus).

So what that allows us to do, is to find the derivative of g w.r.t to all the internal nodes i.e. f, d, c and the input nodes i.e. a & b.

Then we can query the derivative of g w.r.t a
```
a.grad
```

query the derivative of g w.r.t a
```
b.grad
```

Now this query is important as it tells us: How this a & b is affecting -> g -> through this mathematical expression.

So lets say, when we nudge the value of a little bit, then the value of g grows a little bit, therefore adjusting the value of that graph; vice versa.

----------------

**Neural Network are just a Mathematical Expression.**

They take the Input data as well as the weights of the nodes -> MATHEMATICAL EXPRESSION -> Output, the predictions (basically a loss function is generated)


Now, Backpropagation is just a general term. It doesn't care about NN at all. It only cares about arbitral mathematical equations/expressions.

We just happen to use this machinery/mechanism to train a NN.

-----

This is such a very basic, atom level expression. So a and b are in scaler level, so only takes one values each.

(IMP) *See this timestamp once- **5:48 to 6:48***
