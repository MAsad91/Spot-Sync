import React from "react";
import { get, map } from "lodash";
import {
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import moment from 'moment';
import "./style.css";

const TextMessage = ({ context, activityLog }) => {
  return (
    <div className="messageContent">
      <div className="messageHolder">
        <div className="textMessageBubble">
          <div>
            { context.text[0].displayText?.replace(/<[^>]+>/g, '') }
          </div>
          <div className="messageTime">
            { moment(activityLog.createdAt).format("YYYY-MM-DD HH:mm") }
          </div>
        </div>
        <img src="logo-spotsync-dark.svg" alt="spotsync" className="isbpMessageIcon" />
      </div>
    </div>
  )
}

const Suggestions = ({ context }) => {
  return (
    <div className="suggestionsContent">
      <div className="suggestionChipsHolder">
        { map(context.suggestions, (suggestion, index) => (
          <div className="suggestionChip" key={`suggestion-${index}`}>
            {suggestion.title}
          </div>
        ))}
      </div>
    </div>
  )
}

const Form = ({ context, activityLog }) => {
  const form = context.form;
  return (
    <div className="messageContent">
      <div className="messageHolder">
        <div className="formBody">
          {form.title &&
            <div className="mb-10">
              {form.title}
            </div>
          }
          {form.subtitle &&
            <div>
              {form.subtitle}
            </div>
          }

          {form.title && form.subtitle &&
            <hr className="formTitleSeprator" />
          }

          {form.fields &&
            <div className="formFields">
              {
                map(form.fields, (field, index) => {
                  const fieldType = field.fieldType ? field.fieldType : field.type;
                  switch (fieldType) {
                    case "select":
                      return (
                        <FormControl sx={{ m: 1, minWidth: 120 }}>
                          <InputLabel id={activityLog._id}>{field.label ? field.label : field.groupLabel}</InputLabel>
                          <Select
                            lableId={activityLog._id}
                            value={field.select ? field.select[0].selectLabel : ""}
                            label={field.label ? field.label : field.groupLabel}
                            key={`textfield-${index}`}
                            className="mb-10 w-250"
                          >
                            {
                              map(field.select, (option, index) => (
                                <MenuItem value={option.selectLabel} key={`menuItem-${index}`}>
                                  <em>{option.selectLabel}</em>
                                </MenuItem>
                              ))
                            }
                          </Select>
                        </FormControl>
                      )
                    case "checkbox":
                      return (
                        <FormControlLabel
                          control={<Checkbox />}
                          label={field.checkboxes? field.checkboxes[0].checkboxLabel : ""}
                        />
                      )
                    default:
                      return (
                        <TextField
                          name={field.parameter}
                          placeholder={field.placeholder}
                          label={field.label}
                          InputProps={{
                            className: "formTextField w-250",
                          }}
                          type={field.type}
                          disabled={true}
                          InputLabelProps={{ shrink: true }}
                          sx={{ mr: 1 }}
                          key={`textfield-${index}`}
                        />
                      )
                  }
                })
              }
            </div>
          }

          {form.action &&
            <div 
              className="submitButton"
              title={`${form.action.message?.type ? form.action.message?.type : ''}: ${form.action.message?.command ? form.action.message?.command : ''}`.trim()}
            >
              Submit
            </div>
          }
        </div>
        <img src="logo-spotsync-dark.svg" alt="spotsync" className="isbpMessageIcon" />
      </div>
    </div>
  )
}

const Card = ({ context }) => {
  const card = context.card;
  return (
    <div className="messageContent">
      <div className="messageHolder">
        <div className="cardHolder">
          {card.image &&
            <div className="cardImage">
              <img src={card.image.url} alt={card.image.alt} />
            </div>
          }

          {card.title &&
            <div className="mb-10">
              {card.title}
            </div>
          }
          {card.subtitle &&
            <div className="mb-10">
              {card.subtitle}
            </div>
          }

          {card.action && card.action.buttons &&
            <div className="cardAction">
              <div className="submitButton" title={card.action.buttons[0]?.action?.link?.url}>
                {card.action.buttons[0].title}
              </div>
            </div>
          }
        </div>
        <img src="logo-spotsync-dark.svg" alt="spotsync" className="isbpMessageIcon" />
      </div>
    </div>
  )
}

const SpotSyncMessage = ({ activityLog }) => {
  const outputContext = get(activityLog, "outputContext", null)

  if (!outputContext) {
    return <></>
  }

  return (
    <div>
      { map(outputContext, (context, index) => {
        const keys = Object.keys(context)
        if (!keys || keys.length == 0) {
          return <></>
        }

        switch(keys[0]) {
          case "text":
            return <TextMessage context={context} activityLog={activityLog} />
          case "suggestions":
            return <Suggestions context={context} />
          case "form":
            return <Form context={context} activityLog={activityLog} />
          case "card":
            return <Card context={context} />
          default:
            return <>{keys[0]}</>
        }

      })}
    </div>
  );
};
export default SpotSyncMessage;
