import React, { useState } from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { gql, useQuery, useMutation } from '@apollo/client'
import MagnetGrid from './MagnetGrid.js'
import GlobalLoading from './GlobalLoading.js'
import { createStyles, makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) =>
  createStyles({
    dialog: {
      // padding: 4
    }
  })
)

const GET_MAGNETS = gql`
  query {
    me {
      authoredMagnets {
        total
        edges {
          node {
            id
            icon
            mainColor
            secondColor
          }
        }
      }
    }
  }
`

const GIVE_MAGNET = gql`
  mutation($magnetId: Int!, $userId: Int!) {
    giveMagnet(magnetId: $magnetId, userId: $userId) {
      id
    }
  }
`

export default function MagnetGivingDialog({ close, userId }) {
  const { data, loading, error } = useQuery(GET_MAGNETS)
  const [inputError, setInputError] = useState('')
  const [give, { givingLoading, givingError }] = useMutation(GIVE_MAGNET)
  const styles = useStyles()
  const magnets = loading
    ? []
    : data.me.authoredMagnets.edges.map((e) => e.node)
  const [selected, setSelected] = useState(-1)

  if (givingLoading || loading) return <GlobalLoading />

  return (
    <>
      <Dialog open PaperProps={{ className: styles.dialog }} onClose={close}>
        <DialogTitle>Выдача магнита</DialogTitle>
        <DialogContent>
          <MagnetGrid
            onClick={(id) => setSelected(id)}
            selected={selected}
            magnets={magnets}
          />
          <Typography color="error">{inputError}</Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={close}>Отмена</Button>
          <Button color="primary" onClick={() => {
            if (selected == -1) {
              return setInputError('Пожалуйста выберете магнит')
            }else{
              setInputError('')
            }
            give({
              variables: {
                magnetId: selected,
                userId
              }
            }).then(()=>{
              close()
            })
          }}>
            Выдать
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
