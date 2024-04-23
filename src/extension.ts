import * as vscode from 'vscode';
import { Client, Pool } from 'pg';

let notConfirmedСriticalityDecoration : vscode.TextEditorDecorationType;
let lowСriticalityDecoration : vscode.TextEditorDecorationType;
let mediumСriticalityDecoration : vscode.TextEditorDecorationType;
let highСriticalityDecoration : vscode.TextEditorDecorationType;
let criticalСriticalityDecoration : vscode.TextEditorDecorationType;
let unknownСriticalityDecoration : vscode.TextEditorDecorationType;
let config = vscode.workspace.getConfiguration('threatscope');
let pool = new Pool({
	user: config.get('DB.Login'),
	host: config.get('DB.Host'),
	database: config.get('DB.DataBase'),
	password: config.get('DB.Password'),
	port: config.get('DB.Port'),
  });

export async function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('threatscope.activate', 
	r => vscode.window.showInformationMessage('Starting ThreatScope...')));
	let data : any;
	const changeSeverityCommand = "threatscope.changeSeverity";
	const changeSeverityHandler = async(line: number, severity: string) => {
		await changeSeverity(line,severity.replace(/_/g,' '));
		data = await updateDBData(vscode.window.activeTextEditor?.document.uri.fsPath);
		updateDecorators(data);
		errorsProvider.refresh(data);
	  };
	const changeStatusCommand = "threatscope.changeStatus";
	const changeStatusHandler = async(line: number, status: string) => {
		await changeStatus(line,status.replace(/_/g,' '));
		data = await updateDBData(vscode.window.activeTextEditor?.document.uri.fsPath);
		updateDecorators(data);
		errorsProvider.refresh(data);
	  };
	context.subscriptions.push(vscode.commands.registerCommand(changeSeverityCommand, changeSeverityHandler)); 
	context.subscriptions.push(vscode.commands.registerCommand(changeStatusCommand, changeStatusHandler));   
	const errorsProvider = new ErrorsProvider();
	vscode.window.registerTreeDataProvider(
		'errorsTree',
		errorsProvider
		);
	vscode.window.createTreeView('errorsTree', {
		treeDataProvider: errorsProvider
		});
	if (vscode.window.activeTextEditor?.document.uri.fsPath !== undefined) {
		try {
			data = await updateDBData(vscode.window.activeTextEditor?.document.uri.fsPath);
		} catch (e) {
			let result = (e as Error).message;
			vscode.window.showErrorMessage(result);
		}
		vscode.window.showInformationMessage(`Found ${data.length} errors in: ${vscode.window.activeTextEditor?.document.uri.fsPath}`);
		updateDecorators(data);
		errorsProvider.refresh(data);
	}
	vscode.workspace.onDidChangeConfiguration(event => {
		if (event.affectsConfiguration('threatscope')){
			config = vscode.workspace.getConfiguration('threatscope');
			pool = new Pool({
				user: config.get('DB.Login'),
				host: config.get('DB.Host'),
				database: config.get('DB.DataBase'),
				password: config.get('DB.Password'),
				port: config.get('DB.Port'),
			  });
		}
	});
	
	vscode.window.onDidChangeActiveTextEditor(async editor =>{
		if (vscode.window.activeTextEditor?.document.uri.fsPath === undefined) {
			return;
		}
		let data : any;
		try {
			data = await updateDBData(vscode.window.activeTextEditor?.document.uri.fsPath);
		} catch (e) {
			let result = (e as Error).message;
			vscode.window.showErrorMessage(result);
		}
		vscode.window.showInformationMessage(`Found ${data.length} errors in: ${vscode.window.activeTextEditor?.document.uri.fsPath}`);
		updateDecorators(data);
		errorsProvider.refresh(data);
	 });
}
function updateDecorators(data : any){
	if (notConfirmedСriticalityDecoration !==undefined) notConfirmedСriticalityDecoration.dispose();
	if (lowСriticalityDecoration !== undefined) lowСriticalityDecoration.dispose();
	if (mediumСriticalityDecoration !== undefined) mediumСriticalityDecoration.dispose();
	if (highСriticalityDecoration !== undefined) highСriticalityDecoration.dispose();
	if (criticalСriticalityDecoration !== undefined) criticalСriticalityDecoration.dispose();
	if (unknownСriticalityDecoration !== undefined) unknownСriticalityDecoration.dispose(); 
	const notConfirmedOptions : vscode.DecorationOptions[] = [];
	const lowСriticalityOptions : vscode.DecorationOptions[] = [];
	const mediumСriticalityOptions : vscode.DecorationOptions[] = [];
	const highСriticalityOptions : vscode.DecorationOptions[] = [];
	const criticalСriticalityOptions : vscode.DecorationOptions[] = [];
	const unknownСriticalityOptions : vscode.DecorationOptions[] = [];
	
	notConfirmedСriticalityDecoration = vscode.window.createTextEditorDecorationType({
		backgroundColor: 'rgba(' + config.get('Colour.Status.NotConfirmed') + ')',
		opacity: '100%',
		isWholeLine: true
	});
	lowСriticalityDecoration = vscode.window.createTextEditorDecorationType({
		backgroundColor: 'rgba(' + config.get('Colour.Severity.LowSeverity') + ')',
		opacity: '100%',
		isWholeLine: true
	});
	mediumСriticalityDecoration = vscode.window.createTextEditorDecorationType({
		backgroundColor: 'rgba(' + config.get('Colour.Severity.MediumSeverity') + ')',
		opacity: '100%',
		isWholeLine: true
	});
	highСriticalityDecoration = vscode.window.createTextEditorDecorationType({
		backgroundColor: 'rgba(' + config.get('Colour.Severity.HighSeverity') + ')',
		opacity: '100%',
		isWholeLine: true
	});
	criticalСriticalityDecoration = vscode.window.createTextEditorDecorationType({
		backgroundColor: 'rgba(' + config.get('Colour.Severity.CriticalSeverity') + ')',
		opacity: '100%',
		isWholeLine: true
	});
	unknownСriticalityDecoration = vscode.window.createTextEditorDecorationType({
		backgroundColor: 'rgba(' + config.get('Colour.Severity.UnknownSeverity') + ')',
		opacity: '100%',
		isWholeLine: true
	});

	data.forEach((error: any) => {
			const Position = new vscode.Position(Number(error.line)-1,0);
			const range = new vscode.Range(Position, Position);
			const message = new vscode.MarkdownString('Status: ' + error.statusname + '  \n' +
			'Severity: ' + error.severityname + '\n\n' +
			error.errorname + '  \n' +
			error.errordescription + '  \n\n' +
			`Change severity to 
			[low](command:threatscope.changeSeverity?[${error.line},${JSON.stringify("низкая")}]) 
			[medium](command:threatscope.changeSeverity?[${error.line},${JSON.stringify("средняя")}])	
			[high](command:threatscope.changeSeverity?[${error.line},${JSON.stringify("высокая")}])	
			[critical](command:threatscope.changeSeverity?[${error.line},${JSON.stringify("критичная")}])
			[unknown](command:threatscope.changeSeverity?[${error.line},${JSON.stringify("не_указана")}]) ` + '  \n\n' +
			`Change severity to 
			[not Confirmed](command:threatscope.changeStatus?[${error.line},${JSON.stringify("не_подтверждено",null,1)}])	
			[confirmed](command:threatscope.changeStatus?[${error.line},${JSON.stringify("подтверждено")}])`);
			message.isTrusted = true;
			const decoration : vscode.DecorationOptions = {
				range,
				hoverMessage: (message),
			};
	
			if (error.statusname.toLowerCase() === 'не подтверждено') {
				notConfirmedOptions.push(decoration);
			}else
			{
				switch (error.severityname.toLowerCase()) {
					case 'low':
					case 'низкая':
						lowСriticalityOptions.push(decoration);
						break;
					case 'medium':
					case 'средняя':
						mediumСriticalityOptions.push(decoration);
						break;
					case 'high':
					case 'высокая':
						highСriticalityOptions.push(decoration);
						break;
					case 'critical':
					case 'критичная':
						criticalСriticalityOptions.push(decoration);
						break;
					case 'unknown':
					case 'не указана':
						unknownСriticalityOptions.push(decoration);
						break;
					default:
						notConfirmedOptions.push(decoration);
						break;
				}
			}
	});
	if (vscode.window.activeTextEditor) {
		vscode.window.activeTextEditor.setDecorations(notConfirmedСriticalityDecoration, notConfirmedOptions);
		vscode.window.activeTextEditor.setDecorations(lowСriticalityDecoration, lowСriticalityOptions);
		vscode.window.activeTextEditor.setDecorations(mediumСriticalityDecoration, mediumСriticalityOptions);
		vscode.window.activeTextEditor.setDecorations(highСriticalityDecoration, highСriticalityOptions);
		vscode.window.activeTextEditor.setDecorations(criticalСriticalityDecoration, criticalСriticalityOptions);
		vscode.window.activeTextEditor.setDecorations(unknownСriticalityDecoration,unknownСriticalityOptions);
	}
 }
async function updateDBData(editorPath:string | undefined){
	if (editorPath === undefined) return;
	let result = await pool.query('select "Errorlist".errorname,"Errorlist".errordescription,"Recordlist".description,"Recordlist"."location","Recordlist".line,"Severity".severityname,"Status".statusname,"Users".username from "Markups" ' + 
	'join "Recordlist" ON "Recordlist".record_id = "Markups".record_id ' +
	'join "Errorlist" ON "Errorlist".error_id = "Recordlist".error_id ' +
	'join "Severity" ON "Severity".severity_id = "Markups".severity_id ' +
	'join "Status" ON "Status".status_id = "Markups".status_id ' +
	'join "Users" ON "Users".user_id = "Markups".user_id ' +
	`where lower("Recordlist"."location") = lower('${editorPath}') ` +
	' ORDER by line');
	return result.rows;
}
export class ErrorsProvider implements vscode.TreeDataProvider<ErrorTreeItem> {
	private errorsData : ErrorTreeItem[] = [];
	private m_onDidChangeTreeData: vscode.EventEmitter<ErrorTreeItem | undefined> = new vscode.EventEmitter<ErrorTreeItem | undefined>();
	readonly onDidChangeTreeData ? : vscode.Event<ErrorTreeItem | undefined> = this.m_onDidChangeTreeData.event;
	constructor()
	{
		vscode.commands.registerCommand('errorTree.refresh', r => this.refresh());
		vscode.commands.registerCommand('errorTree.onItemClicked', item => this.onItemClicked(item));
		vscode.commands.registerCommand('errorTree.changeToNotConfirmed',item => this.changeToNotConfirmed(item));
		vscode.commands.registerCommand('errorTree.changeToConfirmed',item => this.changeToConfirmed(item));
		vscode.commands.registerCommand('errorTree.changeToLowSeverity',item => this.changeToLowSeverity(item));
		vscode.commands.registerCommand('errorTree.changeToMediumSeverity',item => this.changeToMediumSeverity(item));
		vscode.commands.registerCommand('errorTree.changeToHighSeverity',item => this.changeToHighSeverity(item));
		vscode.commands.registerCommand('errorTree.changeToCriticalSeverity',item => this.changeToCriticalSeverity(item));
		vscode.commands.registerCommand('errorTree.changeToUnknownSeverity',item => this.changeToUnknownSeverity(item));
	}
	changeToNotConfirmed(item: ErrorTreeItem){
		this.changeStatus(item,'не подтверждено');
		vscode.window.showInformationMessage('changed to not confirmed');
	}
	changeToConfirmed(item: ErrorTreeItem){
		this.changeStatus(item,'подтверждено');
		vscode.window.showInformationMessage('changed to confirmed');
	}

	changeToLowSeverity(item: ErrorTreeItem){
		this.changeSeverity(item,'низкая');
		vscode.window.showInformationMessage('Changed to low severity');
	}
	changeToMediumSeverity(item: ErrorTreeItem){
		this.changeSeverity(item,'средняя');
		vscode.window.showInformationMessage('Changed to medium severity');
	}
	changeToHighSeverity(item: ErrorTreeItem){
		this.changeSeverity(item,'высокая');
		vscode.window.showInformationMessage('changed to high severity');
	}
	changeToCriticalSeverity(item: ErrorTreeItem){
		this.changeSeverity(item,'критичная');
		vscode.window.showInformationMessage('changed to critical severity');
	}
	changeToUnknownSeverity(item: ErrorTreeItem){
		this.changeSeverity(item,'не указана');
		vscode.window.showInformationMessage('Changed to unknown severity');
	}
	//remove regex 
	private async changeSeverity(item : ErrorTreeItem, severity : string){
		let filePath = vscode.window.activeTextEditor?.document.uri.fsPath.toLowerCase();
		let line = item.line;
		await changeSeverity(line,severity);
		let data = await updateDBData(filePath);
		this.refresh(data);
		updateDecorators(data);
	}
	private async changeStatus(item : ErrorTreeItem, status : string){
		let filePath = vscode.window.activeTextEditor?.document.uri.fsPath.toLowerCase();
		let line = item.line;
		await changeStatus(line,status);
		let data = await updateDBData(filePath);
		this.refresh(data);
		updateDecorators(data);
	}
	public onItemClicked(item: ErrorTreeItem) {
		if(vscode.window.activeTextEditor === undefined) return;
		let editor = vscode.window.activeTextEditor;
		let line = item.line;
		let pos = new vscode.Position(line-1, 0);
		editor.selection = new vscode.Selection(pos, pos);
		editor.revealRange(new vscode.Range(pos, pos));
	}
	refresh(values? : any)
	{
		if (values !== undefined) {
			this.errorsData = [];
			values.forEach((error: any) => {
				if (error.location.toLowerCase() === vscode.window.activeTextEditor?.document.uri.fsPath.toLowerCase()) {
					this.errorsData.push(new ErrorTreeItem('[' + error.line + '] ' + error.errorname,error.line));
					this.errorsData.at(-1)?.addChild(new ErrorTreeItem('Status: ' + error.statusname,error.line));
					this.errorsData.at(-1)?.addChild(new ErrorTreeItem('Severity: ' + error.severityname,error.line));
					this.errorsData.at(-1)?.addChild(new ErrorTreeItem('Description: ' + error.errordescription,error.line));
				}
			});	
		}
		this.m_onDidChangeTreeData.fire(undefined);
	}
	getTreeItem(element: ErrorTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
		let title = element.label ? element.label.toString() : "";
		let item = new vscode.TreeItem(element.label!,element.collapsibleState);
		item.command = {command: 'errorTree.onItemClicked', title : title, arguments: [element]};
		return item;
	}
	getChildren(element?: ErrorTreeItem | undefined): vscode.ProviderResult<ErrorTreeItem[]> {
		if (element === undefined) {
			return this.errorsData;
		} else {
			return element.children;
		}
	}
	
  }
  async function changeSeverity(line : number, severity : string) {
	let filePath = vscode.window.activeTextEditor?.document.uri.fsPath.toLowerCase();
	await pool.query(`update "Markups" set severity_id = (select severity_id from "Severity" where lower(severityname) = lower('${severity}')),
	user_id = (select user_id from "Users" where lower(username) = lower('${config.get('DB.Login')}')) 
	where record_id = (select record_id from "Recordlist" where lower(location) = lower('${filePath}') and line = '${line}')`);
  }
  async function changeStatus(line : number, status : string){
	let filePath = vscode.window.activeTextEditor?.document.uri.fsPath.toLowerCase();
	await pool.query(`update "Markups" set status_id = (select status_id from "Status" where lower(statusname) = lower('${status}')), 
	user_id = (select user_id from "Users" where lower(username) = lower('${config.get('DB.Login')}')) 
	where record_id = (select record_id from "Recordlist" where lower(location) = lower('${filePath}') and line = '${line}')`);
  } 
  //fix childern context menu
export class ErrorTreeItem extends vscode.TreeItem {
		readonly label : string;
		public children : ErrorTreeItem[] = [];
		readonly line: number;
	constructor(label : string,line : number)
	{
		super(label,vscode.TreeItemCollapsibleState.None);
		this.label = label;
		this.collapsibleState = vscode.TreeItemCollapsibleState.None;
		this.line = line;
	}
	public addChild(children : ErrorTreeItem)
	{
		this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
		this.children.push(children);
	}
	}
	
export function deactivate() {
	pool.end();
}
