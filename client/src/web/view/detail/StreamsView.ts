namespace ymovie.web.view.detail {
	import DataComponent = ymovie.view.DataComponent
	import Media = ymovie.type.Media;

	export class StreamsView extends DataComponent<HTMLDivElement, Data> {
		constructor(){
			super("div", undefined);
		}
		
		render(){
			this.clean();
			this.loading = !this.data;
			if(this.data){
				const data = this.data.data;
				if(data instanceof Media.PlayableScc && data.trailers)
					for(const trailer of data.trailers)
						this.append(new StreamTrailer({trailer}).render());
				
				if(this.data.streams?.length)
					this.append(this.data.streams
						.sort((a, b) => (a.size || 0) - (b.size || 0))
						.map(stream => new StreamItem({stream, source:<Media.Playable>this.data?.data}).render()));
				else
					this.append(new StreamNA(null).render());
			}
			return super.render();
		}
	}

	type Data = undefined | {
		data:Media.Playable;
		streams:Array<Media.Stream>;
	}
}
