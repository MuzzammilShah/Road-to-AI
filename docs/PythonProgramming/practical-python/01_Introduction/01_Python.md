# 1.1 Python

## What is Python?

Python is an interpreted high level programming language.  It is often classified as a
["scripting language"](https://en.wikipedia.org/wiki/Scripting_language) and
is considered similar to languages such as Perl, Tcl, or Ruby.  The syntax
of Python is loosely inspired by elements of C programming.

Python was created by Guido van Rossum around 1990 who named it in honor of Monty Python.

## Where to get Python?

[Python.org](https://www.python.org/) is where you obtain Python.  For the purposes of this course, you
only need a basic installation.  I recommend installing Python 3.6 or newer. Python 3.6 is used in the notes
and solutions.

## Why was Python created?

In the words of Python's creator:

> My original motivation for creating Python was the perceived need
> for a higher level language in the Amoeba [Operating Systems]
> project. I realized that the development of system administration
> utilities in C was taking too long. Moreover, doing these things in
> the Bourne shell wouldn't work for a variety of reasons. ... So,
> there was a need for a language that would bridge the gap between C
> and the shell.
>
> - Guido van Rossum

## Where is Python on my Machine?

Although there are many environments in which you might run Python,
Python is typically installed on your machine as a program that runs
from the terminal or command shell. From the terminal, you should be
able to type `python` like this:

```
bash $ python
Python 3.8.1 (default, Feb 20 2020, 09:29:22)
[Clang 10.0.0 (clang-1000.10.44.4)] on darwin
Type "help", "copyright", "credits" or "license" for more information.
>>> print("hello world")
hello world
>>>
```

If you are new to using the shell or a terminal, you should probably
stop, finish a short tutorial on that first, and then return here.

Although there are many non-shell environments where you can code
Python, you will be a stronger Python programmer if you are able to
run, debug, and interact with Python at the terminal.  This is
Python's native environment.  If you are able to use Python here, you
will be able to use it everywhere else.