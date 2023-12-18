/// <reference path="base/Dialogue.ts"/>

namespace ymovie.web.view {
	import Util = ymovie.util.Util;

	export class AboutView extends base.Dialogue<any> {
		constructor(){
			super(true, undefined);
		}
		
		defaultRender(){
			super.defaultRender();
			
			this.content.innerHTML = `
	<h1>About</h1>

	<h2>FAQ</h2>

	<dl>
		<dt>Is this a remote control?</dt>
		<dd>App can work standalone, it can execute local playback as well as communicate with remote devices (Kodi, Chromecast).</dd>
		<dt>Player does not work. How can I play the stream?</dt>
		<dd>See "Playback" section in this document.</dd>
		<dt>Can I search directly on Webshare?</dt>
		<dd>Yes, suffix your search query with "ws" (i.e. "pulp fiction ws").</dd>
	</dl>

	<h2>Compatibility</h2>
	<p>Following OS and browsers are compatibile:</p>
	<ul>
		<li>Android (Chrome 81)</li>
		<li>iOS (Safari 13.1.1)</li>
		<li>Windows (Chrome 83, Edge 83)</li>
		<li>MacOS (Safari 13.1.1)</li>
		<li>Ubuntu (Chromium 81, Firefox 76)</li>
	</ul>

	<h2>Playback</h2>
	<p>There are various player options with built in capabilities:</p>
	<ul>
		<li class="kodi"><a href="https://kodi.tv/" target="_blank">Kodi</a> - preferred option, compatible with all available streams.</li>
		<li class="vlc"><a href="https://www.videolan.org/" target="_blank">VLC</a> - compatible with most available streams.</li>
		<li class="browser">Browser - limited compatibility, usually works with <a href="https://en.wikipedia.org/wiki/Advanced_Video_Coding" target="_blank">h264</a>+<a target="_blank" href="https://en.wikipedia.org/wiki/Advanced_Audio_Coding">AAC</a> or <a href="https://en.wikipedia.org/wiki/MP3" target="_blank">MP3</a>, mute on <a href="https://en.wikipedia.org/wiki/Dolby_Digital" target="_blank">AC3</a> or <a href="https://en.wikipedia.org/wiki/Dolby_Digital_Plus" target="_blank">EAC3</a>.</li>
		<li class="cast">Cast (chromecast) - capabilities similiar to browser + <a href="https://en.wikipedia.org/wiki/High_Efficiency_Video_Coding" target="_blank">HEVC</a></li>
		<li class="android">Android - opens system dialogue to pick installed video app (or executes the default one)</li>
		<li class="android fix">Android fix - same as Android while appends .mkv extension to the url to satisfy DLNA players.</li>
		<li class="potplayer">PotPlayer</li>
		<li class="infuse"><a href="https://firecore.com/infuse" target="_blank">Infuse</a> - plays the stream using infuse video player</li>
		<li class="iina"><a href="https://iina.io/" target="_blank">IINA</a> - plays the stream using IINA video player</li>
	</ul>

	<p>Smart TV, gaming consoles, Set-top boxes and similiar devices compatible with <a href="https://en.wikipedia.org/wiki/Digital_Living_Network_Alliance" target="_blank">DLNA</a> or <a href="https://en.wikipedia.org/wiki/Universal_Plug_and_Play" target="_blank">UPnP</a> can be controlled by <a href="https://play.google.com/store/apps/details?id=com.bubblesoft.android.bubbleupnp&hl=en_US" target="_blank">BubbleUPNP</a> Android app.</p>

	<h2>Known Issues</h2>
	<ul>
		<li>Windows does not provide native player option until a bug in <a href="https://github.com/MicrosoftDocs/windows-uwp/issues/2500" target="_blank">UWP related to ms-photo: scheme</a> is addressed.</li>
		<li>Windows does not open VLC on icon click. VLC app does not register the necessary scheme/protocol by default. You can enable it with <a href="https://github.com/stefansundin/vlc-protocol" target="_blank">vlc-protocol</a>.</li>
	</ul>

	<h2>Credits</h2>
	<p>Icons by <a href="https://iconmonstr.com" target="_blank">iconmonstr.com</a> &amp; <a href="https://www.flaticon.com/" target="_blank">flaticon.com</a>. SVG to PNG conversion by <a href="https://ezgif.com/svg-to-png" target="_blank">ezgif.com</a>.</p>

	<h2>Version</h2>
	<p>Release date: ${Util.getCommitDate().toLocaleString()}</p>
			`;
		}
		
		close() {
			this.trigger(new type.Action.GoBack());
		}
	}
}
