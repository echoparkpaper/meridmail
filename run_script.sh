#!/bin/sh
python3 /Users/Meridian/meridmail/make_acord125_fillable.py > /Users/Meridian/meridmail/output.log 2>&1
echo "exit=$?" >> /Users/Meridian/meridmail/output.log
