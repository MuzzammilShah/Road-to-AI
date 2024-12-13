Note from the author: It is very easy to understand (Alhamdulillah), it's basically the application of Chain Rule. Nothing to worry about :)

---------

Keeping that simple expression graph in mind, we will now perform backpropagation to the c & e nodes and then to the a & b. 

d & f have already been calculated as they are the direct child nodes of L.

Now, we cannot find the derivative of L wrt c & derivative of L wrt e directly. Since there is another node 'd' that is in the middle of them.

Therefore, we use the chain rule - 

dz / dx = dz/dy . dy/dx

Can also check the link [here](https://en.wikipedia.org/wiki/Chain_rule) 
Explanation example: "If a car travels twice as fast as a bicycle and the bicycle is four times as fast as a walking man, then the car travels 2 × 4 = 8 times as fast as the man."

So, keeping that in mind, lets go and calculate the derivative of L wrt nodes c, e, a, b.

--------

##### **Starting with c & e**

dL/dd had already been calculated (Check end of 4_1-manual-backpropagation notebook)

d = c + e

now, 
Derivative of d wrt c, will be 1
Derivative of d wrt e, will be 1

Because the derivative of '+' operation variables will lead to 1 (Calculus basics, it leads to constant, so 1)

If we try to prove this mathematically:
	d = c + e
	f(x+h) - f(x) / h
	Now, we'll calculate wrt c
	=> ( ((c+h)+e) - (c+e) ) / h
	=> c + h + e - c - e / h
	=> h / h
	=> 1
	Therefore, dd/dc = 1

Therefore, we can just substitute the value respectively.

For node c:
	dL/dc = dL/dd . dd/dc

For node e:
	dL/de = dL/dd . dd/de

------------

##### **Continuing with a & b**

Same principle as above, but a different kind of equation here.

Also remember here, derivative of L wrt e was just calculated above^ (dL/de)

e = a * b

Therefore, 
Derivative of e wrt a, will be b
Derivative of e wrt b, will be a

Because the derivative of the same variable at the denominator gets out, so the other variable in the product remains (Calculus derivative theory itself)
	d/da(a * b) = b

If we try to prove this mathematically,
	e = a * b
	f(x+h) - f(x) / h
	Remember, f(x) is equation here. So, finding wrt a, substituting the values
	=> ( ((a + h) * b) - (a * b) ) / h
	=> ab + hb - ab / h
	=> hb / h
	=> b
	Therefore, de/da = b

Therefore, we can just substitute the value respectively.

For node a:
	dL/da = dL/de . dd/da

For node b:
	dL/db = dL/de . dd/db

--------

And that was it! So we basically iterated through each node one by one, and locally applied the chain rule on each of the operations. Therefore we see backwards from L, as to how that output was produced.

**And THAT IS WHAT BACKPROPAGATION IS - It is just a recursive application of chain rule, backwards through the computational graph.** :)