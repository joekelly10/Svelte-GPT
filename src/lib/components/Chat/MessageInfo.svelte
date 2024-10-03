<script>
    import { fade, slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { formatDate, getCost } from '$lib/utils/helpers'

    export let message

    let cost
    $: cost = getCost(message.model.id, message.usage)
</script>

<div class='message-info' in:slide={{ axis: 'x', duration: 150, easing: quartOut }} out:fade={{ duration: 150, easing: quartOut }}>
    <div class='inner'>
        <div class='model-name'>
            {message.model.name}
        </div>
        <div class='model-settings'>
            <div class='top-p-icon'>
                <div class='fill' style='height:{message.top_p * 100}%'></div>
            </div>
            {message.top_p.toFixed(1)}
            <svg class='temperature-icon' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' id='temperature-2'><path d='M13,15.28V10.5a1,1,0,0,0-2,0v4.78A2,2,0,0,0,10,17a2,2,0,0,0,4,0A2,2,0,0,0,13,15.28ZM16.5,13V5.5a4.5,4.5,0,0,0-9,0V13a6,6,0,0,0,3.21,9.83A7,7,0,0,0,12,23,6,6,0,0,0,16.5,13Zm-2,7.07a4,4,0,0,1-5.32-6,1,1,0,0,0,.3-.71V5.5a2.5,2.5,0,0,1,5,0v7.94a1,1,0,0,0,.3.71,4,4,0,0,1-.28,6Z'></path></svg>
            {message.temperature.toFixed(1)}
        </div>
        <div class='timestamp'>
            {@html formatDate(message.timestamp)}
        </div>
        <div class='usage'>
            in {message.usage.input_tokens} / out {message.usage.output_tokens}
        </div>
        <div class='cost'>
            ${(cost.total / 100).toFixed(5)}
        </div>
    </div>
</div>

<style lang='sass'>
    .message-info
        position:    absolute
        left:        0 - space.$default-padding
        top:         space.$default-padding - 7px
        transform:   translateX(-100%)
        font-size:   14px
        line-height: 1.6
        text-align:  right
        color:       $background-lightest
        white-space: nowrap

        .inner
            min-width: 128px
    
    .model-settings
        .top-p-icon
            display:        inline-block
            vertical-align: middle
            margin:         -3px 5px 0 0
            width:          4px
            height:         13px
            border-radius:  3px
            border:         1px solid $background-lightest

            .fill
                background-color: $background-lightest
        
        .temperature-icon
            display:        inline-block
            vertical-align: middle
            margin:         -3px 2px 0 8px
            height:         16px
            fill:           $background-lightest
    
    .timestamp
        margin-top: 22.5px
</style>
