import * as Y from 'yjs';

export class MonacoBinding {
  constructor(yText, monacoModel, editors, monaco) {
    this.yText = yText;
    this.monacoModel = monacoModel;
    this.editors = editors;
    this.monaco = monaco;
    this._observeYText = this._observeYText.bind(this);
    this._observeMonaco = this._observeMonaco.bind(this);
    this._onDispose = this._onDispose.bind(this);
    this._disposables = [];
    this._isApplyingRemote = false;
    this._isApplyingLocal = false;
    this._init();
  }

  _init() {
    this.yText.observe(this._observeYText);
    this._disposables.push(
      this.monacoModel.onDidChangeContent(this._observeMonaco)
    );
    this._disposables.push({ dispose: this._onDispose });
    if (this.monacoModel.getValue() !== this.yText.toString()) {
      this.monacoModel.setValue(this.yText.toString());
    }
  }

  _observeYText(event) {
    if (this._isApplyingLocal) return;
    this._isApplyingRemote = true;
    const delta = event.delta;
    let index = 0;
    delta.forEach(op => {
      if (op.retain) {
        index += op.retain;
      } else if (op.insert) {
        this.monacoModel.applyEdits([
          {
            range: new this.monaco.Range(
              this.monacoModel.getPositionAt(index).lineNumber,
              this.monacoModel.getPositionAt(index).column,
              this.monacoModel.getPositionAt(index).lineNumber,
              this.monacoModel.getPositionAt(index).column
            ),
            text: op.insert,
            forceMoveMarkers: true
          }
        ]);
        index += op.insert.length;
      } else if (op.delete) {
        const from = this.monacoModel.getPositionAt(index);
        const to = this.monacoModel.getPositionAt(index + op.delete);
        this.monacoModel.applyEdits([
          {
            range: new this.monaco.Range(
              from.lineNumber,
              from.column,
              to.lineNumber,
              to.column
            ),
            text: '',
            forceMoveMarkers: true
          }
        ]);
      }
    });
    this._isApplyingRemote = false;
  }

  _observeMonaco(event) {
    if (this._isApplyingRemote) return;
    this._isApplyingLocal = true;
    event.changes.forEach(change => {
      const start = this.monacoModel.getOffsetAt(change.range.getStartPosition());
      const end = this.monacoModel.getOffsetAt(change.range.getEndPosition());
      if (change.text.length > 0) {
        this.yText.delete(start, end - start);
        this.yText.insert(start, change.text);
      } else {
        this.yText.delete(start, end - start);
      }
    });
    this._isApplyingLocal = false;
  }

  _onDispose() {
    this.yText.unobserve(this._observeYText);
    this._disposables.forEach(d => d.dispose && d.dispose());
  }

  destroy() {
    this._onDispose();
  }
}
