import { Component } from '@angular/core';

const { WebVTTParser } = require('webvtt-parser');

type PersonBlock = {
  name: String,
  text: String[]
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  file_name: string = '';
  converted_content: PersonBlock[] = [];

  copy_content() {
      const converted_text = this.converted_content
      .map((block: PersonBlock) => (block.name + '\n' + block.text.join(' '))
      ).join('\n\n');

    navigator.clipboard.writeText(converted_text);
  }

  file_selected(evt: any) {
    const reader = new FileReader();
    reader.addEventListener('loadend', () => {
      const parser = new WebVTTParser();
      const tree = parser.parse(reader.result);

      if (tree.errors.length > 0) {
        // do something with errors
        return;
      }

      let final = tree.cues.reduce((acc: PersonBlock[], cur: any) => {
        const text_parts = cur.text.split(':');
        const name = text_parts[0] ? text_parts[0].trim() : 'Unknown';
        const text = text_parts[1] ? text_parts[1].trim() : '[silence]';

        if (acc.length === 0) {
          acc.push({
            name,
            text: [text]
          });

          return acc;
        }

        const last_person = acc[acc.length - 1];
        if (last_person.name === name) {
          // same person as last cue
          last_person.text.push(text);
        } else {
          // New speaker
          acc.push({
            name,
            text: [text]
          });
        }

        return acc;
      }, []);
      this.converted_content = final;

      this.file_name = evt.target.files[0].name;
    });
    reader.readAsText(evt.target.files[0]);
  }

}

