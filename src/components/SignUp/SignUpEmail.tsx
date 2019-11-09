import React from 'react'

import { Formik, Form, Field } from 'formik'
import { TextField } from 'formik-material-ui'
import * as Yup from 'yup'

import { useDispatch } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Email from '@material-ui/icons/Email'
import Typography from '@material-ui/core/Typography'

import { addUser } from '../../Redux/Actions'
import * as routes from '../../constants/routes'
import history from '../../Helpers/History'
import Firebase, { withFirebase } from '../Firebase'

import useSnackbarContext from '../Snackbar/Context'

const SignupScheme = Yup.object().shape({
  username: Yup.string().required('Required'),
  email: Yup.string()
    .required('Required')
    .email(),
  password: Yup.string()
    .required('Required')
    .min(6),
  passwordConfirmation: Yup.string()
    .required('Required')
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
})

const useStyles = makeStyles(theme => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 'calc(100% - 90px)'
  },
  leftIcon: {
    marginRight: theme.spacing(1)
  },
  title: {
    flexGrow: 1
  }
}))

interface FirebaseInterface {
  firebase: Firebase
}

export const SignUpForm: React.FC<FirebaseInterface> = ({ firebase }) => {
  const { setSnackbarState } = useSnackbarContext()
  const dispatch = useDispatch()
  const classes = useStyles()

  return (
    <div className="signup_form">
      <Typography variant="h5" component="h2" className={classes.title}>
        Sign Up
      </Typography>
      <Formik
        initialValues={{
          username: '',
          email: '',
          password: '',
          passwordConfirmation: ''
        }}
        validationSchema={SignupScheme}
        onSubmit={(values, { setSubmitting }): void => {
          const { username, email, password } = values

          firebase
            .doCreateUserWithEmailAndPassword(email, password)
            .then(async emailAuthUser => {
              if (emailAuthUser.user && emailAuthUser.user.uid) {
                await firebase.user(emailAuthUser.user.uid).set({
                  username,
                  email: emailAuthUser.user.email
                })

                dispatch(
                  addUser({
                    loggedIn: true,
                    userName: username,
                    userId: emailAuthUser.user.uid
                  })
                )
              }

              setSubmitting(false)
              setSnackbarState({ message: 'Logged in!', variant: 'success' })
              history.push(routes.home)
            })
            .catch((error: Record<string, string>) => {
              setSubmitting(false)
              setSnackbarState({ message: error.message, variant: 'error' })
            })
        }}
      >
        {({ isSubmitting }): React.ReactNode => (
          <Form>
            <Field
              type="text"
              name="username"
              component={TextField}
              className={classes.textField}
              id="username"
              label="Username"
              variant="outlined"
              margin="normal"
              fullWidth
            />
            <Field
              type="text"
              name="email"
              component={TextField}
              className={classes.textField}
              id="name"
              label="E-mail"
              variant="outlined"
              margin="normal"
              fullWidth
            />
            <Field
              type="password"
              name="password"
              component={TextField}
              className={classes.textField}
              id="password"
              label="Password"
              variant="outlined"
              margin="normal"
              fullWidth
            />
            <Field
              type="password"
              name="passwordConfirmation"
              component={TextField}
              className={classes.textField}
              id="passwordConfirmation"
              label="Confirm Password"
              variant="outlined"
              margin="normal"
              fullWidth
            />

            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={isSubmitting}
            >
              <Email className={classes.leftIcon} />
              Sign Up
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default withFirebase(SignUpForm)
