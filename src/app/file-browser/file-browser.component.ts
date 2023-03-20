import { NestedTreeControl } from '@angular/cdk/tree';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { map, Observable, startWith } from 'rxjs';
import { flatMapDeep } from 'lodash';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

interface FileNode {
  name: string;
  children?: FileNode[];
  parent?: FileNode;
  path?: string;
}

const TREE_DATA: FileNode[] = [
  {
    name: 'Folder 1',
    children: [
      { name: 'file1.pdf' },
      { name: 'file2.docx' },
      { name: 'file3.txt' },
    ],
  },
  {
    name: 'Folder 2',
    children: [
      {
        name: 'Folder 3',
        children: [{ name: 'file.jpeg' }, { name: 'file.png' }],
      },
      {
        name: 'Folder 4',
        children: [{ name: 'file.xls' }, { name: 'file.txt' }],
      },
    ],
  },
];

@Component({
  selector: 'app-file-browser',
  templateUrl: './file-browser.component.html',
  styleUrls: ['./file-browser.component.scss'],
})
export class FileBrowserComponent {
  treeControl = new NestedTreeControl<FileNode>((node) => node.children);
  dataSource = new MatTreeNestedDataSource<FileNode>();

  options = flatMapDeep(TREE_DATA, (node) => {
    return [
      node,
      ...(node.children?.map((c) => ({
        ...c,
        path: `${node.name}/${c.name}`,
        parent: node,
      })) ?? []),
    ];
  });

  myControl = new FormControl('');
  filteredOptions: Observable<string[]> | undefined;
  selectedFolder?: FileNode[];

  ngOnInit() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options
      .map((o) => o.path ?? o.name)
      .filter((option) => option.toLowerCase().includes(filterValue));
  }

  constructor() {
    this.dataSource.data = TREE_DATA;
  }

  itemSelected(selected: MatAutocompleteSelectedEvent) {
    const option = this.options.find((o) => (o.path ?? o.name) === selected.option.value);
    this.selectedFolder = option?.parent?.children ?? option?.children;
  }

  select(fileNode: FileNode) {
    this.selectedFolder = fileNode.children;
  }

  hasChild = (_: number, node: FileNode) =>
    !!node.children && node.children.length > 0;
}
