from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileRequired
from wtforms import StringField,PasswordField,TextAreaField,TelField,URLField,SelectField,validators,EmailField




class RegistrationForm(FlaskForm):
    UserName=StringField(default=None,validators=[validators.DataRequired(),validators.Length(min=1, max=32)])
    UserEmail=EmailField(default=None,validators=[validators.DataRequired(),validators.Email()])
    UserNumber=TelField(default=None,validators=[validators.DataRequired(),validators.Length(min=9, max=12)])
    UserPassword=PasswordField(default=None,validators=[validators.DataRequired(),validators.Length(min=7, max=32)])
    UserVoterID=StringField(default=None,validators=[validators.DataRequired(),validators.Length(min=1, max=32)])
    UserAADHAR=StringField(default=None,validators=[validators.DataRequired(),validators.Length(min=1, max=32)])
    UserAgreement=SelectField(default=None,choices=[('Yes','Yes'),('No','No')],validators=[validators.DataRequired()])
    # UserFiles=FileField(default=None)
  

class Basic_Registration(FlaskForm):
    UserEmail=EmailField(default=None,validators=[validators.DataRequired(),validators.Email()])
    UserPassword=PasswordField(default=None,validators=[validators.DataRequired(),validators.Length(min=7, max=32)])
    UserAgreement=SelectField(default=None,choices=[('Yes','Yes'),('No','No')],validators=[validators.DataRequired()])
    # UserFiles=FileField(default=None)
    

 
class LoginForm(FlaskForm):
    UserEmail=StringField(default=None,validators=[validators.DataRequired()])
    UserPassword=PasswordField(default=None,validators=[validators.DataRequired(),validators.Length(min=7, max=32)]) 

class ResetForm(FlaskForm):
    UserPassword=PasswordField(default=None,validators=[validators.DataRequired(),validators.Length(min=7, max=32)])  
