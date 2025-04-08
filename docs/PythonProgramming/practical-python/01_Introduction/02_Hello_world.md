# 1.2 A First Program

This section discusses the creation of your first program, running the
interpreter, and some basic debugging.

## Running Python

Python programs always run inside an interpreter.

The interpreter is a "console-based" application that normally runs
from a command shell.

```bash
python3
Python 3.6.1 (v3.6.1:69c0db5050, Mar 21 2017, 01:21:04)
[GCC 4.2.1 (Apple Inc. build 5666) (dot 3)] on darwin
Type "help", "copyright", "credits" or "license" for more information.
>>>
```

Expert programmers usually have no problem using the interpreter in
this way, but it's not so user-friendly for beginners.  You may be using
an environment that provides a different interface to Python.  That's fine,
but learning how to run Python terminal is still a useful skill to know.

## Interactive Mode

When you start Python, you get an *interactive* mode where you can experiment.

If you start typing statements, they will run immediately. There is no
edit/compile/run/debug cycle.

```python
>>> print('hello world')
hello world
>>> 37*42
1554
>>> for i in range(5):
...     print(i)
...
0
1
2
3
4
>>>
```

This so-called *read-eval-print-loop* (or REPL) is very useful for debugging and exploration.

If you're using an IDE, it might be hidden behind a menu option or other window.

Let's take a closer look at the elements of the REPL:

- `>>>` is the interpreter prompt for starting a new statement.
- `...` is the interpreter prompt for continuing a statement. Enter a blank line to finish typing and run what you've entered.

The `...` prompt may or may not be shown depending on your environment. For this course,
it is shown as blanks to make it easier to cut/paste code samples.

The underscore `_` holds the last result.

```python
>>> 37 * 42
1554
>>> _ * 2
3108
>>> _ + 50
3158
>>>
```

*This is only true in the interactive mode.* You never use `_` in a program.

## Creating programs

Programs are put in `.py` files.

```python
# hello.py
print('hello world')
```

You can create these files with your favorite text editor.

## Running Programs

To execute a program, run it in the terminal with the `python` command.
For example, in command-line Unix:

```bash
bash % python hello.py
hello world
bash %
```

Or from the Windows shell:

```
C:\SomeFolder>hello.py
hello world

C:\SomeFolder>c:\python36\python hello.py
hello world
```

Note: On Windows, you may need to specify a full path to the Python interpreter such as `c:\python36\python`.
However, if Python is installed in its usual way, you might be able to just type the name of the program
such as `hello.py`.

## Statements

A python program is a sequence of statements:

```python
a = 3 + 4
b = a * 2
print(b)
```

Each statement is terminated by a newline. Statements are executed one after the other until control reaches the end of the file.

## Comments

Comments are text that will not be executed.

```python
a = 3 + 4
# This is a comment
b = a * 2
print(b)
```

Comments are denoted by `#` and extend to the end of the line.

## Variables

A variable is a name for a value. You can use letters (lower and
upper-case) from a to z. As well as the character underscore `_`.
Numbers can also be part of the name of a variable, except as the
first character.

```python
height = 442 # valid
_height = 442 # valid
height2 = 442 # valid
2height = 442 # invalid
```

## Types

Variables do not need to be declared with the type of the value.  The type
is associated with the value on the right hand side, not name of the variable.

```python
height = 442           # An integer
height = 442.0         # Floating point
height = 'Really tall' # A string
```

Python is dynamically typed. The perceived "type" of a variable might change
as a program executes depending on the current value assigned to it.

## Case Sensitivity

Python is case sensitive. Upper and lower-case letters are considered different letters.
These are all different variables:

```python
name = 'Jake'
Name = 'Elwood'
NAME = 'Guido'
```

Language statements are always lower-case.

```python
while x < 0:   # OK
WHILE x < 0:   # ERROR
```

## Looping

The `while` statement executes a loop.

```python
while num_bills * bill_thickness < sears_height:
    print(day, num_bills, num_bills * bill_thickness)
    day = day + 1
    num_bills = num_bills * 2

print('Number of days', day)
```

The statements indented below the `while` will execute as long as the expression after the `while` is `true`.

## Indentation

Indentation is used to denote groups of statements that go together.
Consider the previous example:

```python
while num_bills * bill_thickness < sears_height:
    print(day, num_bills, num_bills * bill_thickness)
    day = day + 1
    num_bills = num_bills * 2

print('Number of days', day)
```

Indentation groups the following statements together as the operations that repeat:

```python
    print(day, num_bills, num_bills * bill_thickness)
    day = day + 1
    num_bills = num_bills * 2
```

Because the `print()` statement at the end is not indented, it
does not belong to the loop. The empty line is just for
readability. It does not affect the execution.

## Indentation best practices

* Use spaces instead of tabs.
* Use 4 spaces per level.
* Use a Python-aware editor.

Python's only requirement is that indentation within the same block
be consistent.   For example, this is an error:

```python
while num_bills * bill_thickness < sears_height:
    print(day, num_bills, num_bills * bill_thickness)
        day = day + 1 # ERROR
    num_bills = num_bills * 2
```

## Conditionals

The `if` statement is used to execute a conditional:

```python
if a > b:
    print('Computer says no')
else:
    print('Computer says yes')
```

You can check for multiple conditions by adding extra checks using `elif`.

```python
if a > b:
    print('Computer says no')
elif a == b:
    print('Computer says yes')
else:
    print('Computer says maybe')
```

## Printing

The `print` function produces a single line of text with the values passed.

```python
print('Hello world!') # Prints the text 'Hello world!'
```

You can use variables. The text printed will be the value of the variable, not the name.

```python
x = 100
print(x) # Prints the text '100'
```

If you pass more than one value to `print` they are separated by spaces.

```python
name = 'Jake'
print('My name is', name) # Print the text 'My name is Jake'
```

`print()` always puts a newline at the end.

```python
print('Hello')
print('My name is', 'Jake')
```

This prints:

```code
Hello
My name is Jake
```

The extra newline can be suppressed:

```python
print('Hello', end=' ')
print('My name is', 'Jake')
```

This code will now print:

```code
Hello My name is Jake
```

## User input

To read a line of typed user input, use the `input()` function:

```python
name = input('Enter your name:')
print('Your name is', name)
```

`input` prints a prompt to the user and returns their response.
This is useful for small programs, learning exercises or simple debugging.
It is not widely used for real programs.

## pass statement

Sometimes you need to specify an empty code block. The keyword `pass` is used for it.

```python
if a > b:
    pass
else:
    print('Computer says false')
```

This is also called a "no-op" statement. It does nothing. It serves as a placeholder for statements, possibly to be added later.