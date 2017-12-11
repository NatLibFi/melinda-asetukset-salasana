/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* UI for changing passwords
*
* Copyright (C) 2015-2017 University Of Helsinki (The National Library Of Finland)
*
* This file is part of melinda-change-password-ui
*
* melinda-change-password-ui program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* melinda-eresource-tool is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/

import React from 'react';
import classNames from 'classnames';

import '../../styles/components/change-password-form-panel.scss';

const illegalCharacters = '#';
const maxLength = 10;

export class ChangePasswordFormPanel extends React.Component {

  static propTypes = {
    title: React.PropTypes.string.isRequired,
    passwordLabel: React.PropTypes.string,
    passwordVerifyLabel: React.PropTypes.string,
    saveButtonLabel: React.PropTypes.string,
    onSave: React.PropTypes.func.isRequired,
    removeSession: React.PropTypes.func.isRequired,
    state: React.PropTypes.string.isRequired,
    error: React.PropTypes.string
  }

  constructor() {
    super();

    this.state = {
      password: '',
      password_valid: true,
      password_active: false,
      password_verify: '',
      password_verify_valid: true,
      password_verify_active: false,
      passwords_match: true,
      form_valid: false,
      form_error: null
    };
  }

  updatePassword(event) {
    event.persist();

    this.setState((state) => {
      const { id, value } = event.target;

      const newState = {
        ...{
          password: state.password,
          password_verify: state.password_verify
        },
        [id]: value,
        [id + '_active']: true,
      };

      const validation = this.validatePassword(value);

      const passwords_match = newState.password === newState.password_verify;

      newState.passwords_match = newState.password.length === 0 || newState.password_verify.length === 0 || passwords_match;

      newState[id + '_valid'] = validation.valid;

      newState.form_valid = validation.valid && passwords_match && newState.password.length > 0 && newState.password_verify.length > 0;

      if (!validation.valid) newState.form_error = validation.error;
      else newState.form_error = null;

      return newState;
    });
  }

  blurInput(event) {
    event.persist();

    this.setState(() => {
      const { id } = event.target;

      const newState = {
        [id + '_active']: false
      };

      return newState;
    });
  }

  validatePassword(password) {
    if (password.match(new RegExp(illegalCharacters))) {
      return {
        valid: false,
        error: `Salasanassa kiellettyjä merkkejä (${illegalCharacters})`
      };
    }

    if (password.length > maxLength) {
      return {
        valid: false,
        error: `Salasanan pituus ei saa ylittää ${maxLength} merkkiä`
      };
    }

    return {
      valid: true
    };
  }

  executeSave(event) {
    event.preventDefault();
    
    const { password, password_verify } = this.state;

    this.props.onSave(password, password_verify);
  }

  renderPreloader() {
    return (
      <div className="progress">
        <div className="indeterminate" />
      </div>
    );
  }

  isSaveButtonDisabled() {
    return !this.state.form_valid ? 'disabled': '';
  }

  renderSuccessPanel() {

    return (
      <div className="card-content">
        <p>Salasanan vaihto onnistui.</p>

        <div className="spacer" />

        <div className="right-align">
          <button className="btn waves-effect waves-light" type="submit" name="action" onClick={this.props.removeSession}>Kirjaudu ulos
            <i className="material-icons right">send</i>
          </button>
        </div>
      </div> 
    );
  }

  renderErrorMessage() {
    if (this.props.error) {
      return (
        <p>{this.props.error}</p>
      );
    }
    else if (this.state.form_error) {
      return (
        <p>{this.state.form_error}</p>
      );
    }
    else if (!this.state.passwords_match) {
      return (
        <p>Salasanat eivät täsmää</p>
      );
    }
  }

  renderForm() {
    const { 
      passwordLabel = 'Salasana', 
      passwordVerifyLabel = 'Salasana uudelleen', 
      saveButtonLabel = 'Tallenna' 
    } = this.props;

    const { password, password_valid, password_verify, password_verify_valid, password_verify_active, passwords_match } = this.state;

    return (
      <div className="card-content">
       
        <form>
          <div className="col s2 offset-s1 input-field">
            <input id="password" type="password" className={classNames({'invalid': !password_valid})} value={password} onChange={this.updatePassword.bind(this)} onBlur={this.blurInput.bind(this)} />
            <label htmlFor="password">{passwordLabel}</label>
          </div>

          <div className="col s2 offset-s1 input-field">
            <input id="password_verify" type="password" className={classNames({'invalid': !password_verify_active && !passwords_match || !password_verify_valid})} value={password_verify} onChange={this.updatePassword.bind(this)} onBlur={this.blurInput.bind(this)} />
            <label htmlFor="password_verify">{passwordVerifyLabel}</label>
          </div>

          <div className="spacer" />
          {this.renderErrorMessage()}
          <div className="spacer" />

          <div className="right-align">
            <button className="btn waves-effect waves-light" type="submit" disabled={this.isSaveButtonDisabled()} name="action" onClick={this.executeSave.bind(this)}>{saveButtonLabel}
              <i className="material-icons right">send</i>
            </button>
          </div>
        </form>
      
      </div>
    );
  }

  render() {
    const { title } = this.props;

    return (
      <div className="card change-password-form-panel valign">
      
        <div className="card-panel teal lighten-2">
          <h4>{title}</h4>
        </div>

        {this.props.state === 'SUCCESS' ? this.renderSuccessPanel() : this.renderForm()}

        {this.props.state === 'LOADING' ? this.renderPreloader() :''}    
      </div>
    );  
  }
}