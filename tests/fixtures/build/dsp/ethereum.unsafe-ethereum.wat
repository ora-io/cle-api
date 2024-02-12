(module
  (type $t0 (func (param i32 i32) (result i32)))
  (type $t1 (func (param i32 i32 i32) (result i32)))
  (type $t2 (func (result i32)))
  (type $t3 (func (param i32) (result i32)))
  (type $t4 (func (param i32 i32)))
  (type $t5 (func))
  (type $t6 (func (param i32)))
  (type $t7 (func (param i32 i32 i32 i32) (result i32)))
  (type $t8 (func (param i32 i32 i32)))
  (type $t9 (func (param i32) (result i64)))
  (type $t10 (func (param i64)))
  (type $t11 (func (param i64) (result i32)))
  (type $t12 (func (param i32 i32 i32 i32)))
  (import "env" "wasm_input" (func $env.wasm_input (type $t9)))
  (import "env" "wasm_write_context" (func $env.wasm_write_context (type $t10)))
  (import "env" "require" (func $env.require (type $t6)))
  (func $f3 (type $t7) (param $p0 i32) (param $p1 i32) (param $p2 i32) (param $p3 i32) (result i32)
    (local $l4 i32)
    global.get $g0_1
    i32.const 32
    i32.sub
    local.tee $l4
    global.set $g0_1
    local.get $l4
    local.get $p0
    i32.store offset=24
    local.get $l4
    local.get $p1
    i32.store offset=20
    local.get $l4
    local.get $p2
    i32.store offset=16
    local.get $l4
    local.get $p3
    i32.store offset=12
    local.get $l4
    local.get $l4
    i32.load offset=24
    local.get $l4
    i32.load offset=20
    i32.add
    i32.load8_u
    i32.store8 offset=11
    block $B0
      block $B1
        local.get $l4
        i32.load8_u offset=11
        i32.const 0
        i32.lt_u
        br_if $B1
        local.get $l4
        i32.load8_u offset=11
        i32.const 127
        i32.gt_u
        br_if $B1
        local.get $l4
        i32.load offset=16
        i32.const 0
        i32.store
        local.get $l4
        i32.load offset=12
        i32.const 0
        i32.store
        local.get $l4
        i32.const 1
        i32.store8 offset=31
        br $B0
      end
      block $B2
        local.get $l4
        i32.load8_u offset=11
        i32.const 128
        i32.lt_u
        br_if $B2
        local.get $l4
        i32.load8_u offset=11
        i32.const 183
        i32.gt_u
        br_if $B2
        local.get $l4
        i32.load offset=16
        i32.const 0
        i32.store
        local.get $l4
        i32.load offset=12
        local.get $l4
        i32.load offset=24
        local.get $l4
        i32.load offset=20
        i32.add
        i32.load8_u
        i32.const 128
        i32.sub
        i32.store
        local.get $l4
        i32.const 2
        i32.store8 offset=31
        br $B0
      end
      block $B3
        local.get $l4
        i32.load8_u offset=11
        i32.const 184
        i32.lt_u
        br_if $B3
        local.get $l4
        i32.load8_u offset=11
        i32.const 191
        i32.gt_u
        br_if $B3
        local.get $l4
        i32.load offset=16
        local.get $l4
        i32.load offset=24
        local.get $l4
        i32.load offset=20
        i32.add
        i32.load8_u
        i32.const 183
        i32.sub
        i32.store
        local.get $l4
        i32.load offset=24
        local.get $l4
        i32.load offset=20
        i32.const 1
        i32.add
        local.get $l4
        i32.load offset=20
        local.get $l4
        i32.load offset=16
        i32.load
        i32.add
        call $f4
        local.set $p0
        local.get $l4
        i32.load offset=12
        local.get $p0
        i32.store
        local.get $l4
        i32.const 3
        i32.store8 offset=31
        br $B0
      end
      block $B4
        local.get $l4
        i32.load8_u offset=11
        i32.const 192
        i32.lt_u
        br_if $B4
        local.get $l4
        i32.load8_u offset=11
        i32.const 247
        i32.gt_u
        br_if $B4
        local.get $l4
        i32.load offset=16
        i32.const 0
        i32.store
        local.get $l4
        i32.load offset=12
        local.get $l4
        i32.load offset=24
        local.get $l4
        i32.load offset=20
        i32.add
        i32.load8_u
        i32.const 192
        i32.sub
        i32.store
        local.get $l4
        i32.const 4
        i32.store8 offset=31
        br $B0
      end
      block $B5
        local.get $l4
        i32.load8_u offset=11
        i32.const 248
        i32.lt_u
        br_if $B5
        local.get $l4
        i32.load8_u offset=11
        i32.const 255
        i32.gt_u
        br_if $B5
        local.get $l4
        i32.load offset=16
        local.get $l4
        i32.load offset=24
        local.get $l4
        i32.load offset=20
        i32.add
        i32.load8_u
        i32.const 247
        i32.sub
        i32.store
        local.get $l4
        i32.load offset=24
        local.get $l4
        i32.load offset=20
        i32.const 1
        i32.add
        local.get $l4
        i32.load offset=20
        local.get $l4
        i32.load offset=16
        i32.load
        i32.add
        call $f4
        local.set $p0
        local.get $l4
        i32.load offset=12
        local.get $p0
        i32.store
        local.get $l4
        i32.const 5
        i32.store8 offset=31
        br $B0
      end
      local.get $l4
      i32.const 0
      i32.store8 offset=31
    end
    local.get $l4
    i32.load8_u offset=31
    local.get $l4
    i32.const 32
    i32.add
    global.set $g0_1)
  (func $f4 (type $t1) (param $p0 i32) (param $p1 i32) (param $p2 i32) (result i32)
    (local $l3 i32)
    global.get $g0_1
    i32.const 16
    i32.sub
    local.tee $l3
    local.get $p0
    i32.store offset=12
    local.get $l3
    local.get $p1
    i32.store offset=8
    local.get $l3
    local.get $p2
    i32.store offset=4
    local.get $l3
    i32.const 0
    i32.store
    loop $L0
      local.get $l3
      i32.load offset=8
      local.get $l3
      i32.load offset=4
      i32.gt_s
      i32.eqz
      if $I1
        local.get $l3
        local.get $l3
        i32.load
        i32.const 8
        i32.shl
        i32.store
        local.get $l3
        local.get $l3
        i32.load offset=12
        local.get $l3
        i32.load offset=8
        i32.add
        i32.load8_u
        local.get $l3
        i32.load
        i32.add
        i32.store
        local.get $l3
        local.get $l3
        i32.load offset=8
        i32.const 1
        i32.add
        i32.store offset=8
        br $L0
      end
    end
    local.get $l3
    i32.load)
  (func $__new (export "__new") (type $t0) (param $p0 i32) (param $p1 i32) (result i32)
    (local $l2 i32) (local $l3 i32) (local $l4 i32) (local $l5 i32) (local $l6 i32) (local $l7 i32)
    local.get $p0
    i32.const 1073741804
    i32.gt_u
    if $I0
      unreachable
    end
    local.get $p0
    i32.const 16
    i32.add
    local.tee $l2
    i32.const 1073741820
    i32.gt_u
    if $I1
      unreachable
    end
    global.get $g0
    local.tee $l6
    i32.const 4
    i32.add
    local.tee $l4
    local.get $l2
    i32.const 19
    i32.add
    i32.const -16
    i32.and
    i32.const 4
    i32.sub
    local.tee $l7
    i32.add
    local.tee $l2
    memory.size
    local.tee $l5
    i32.const 16
    i32.shl
    i32.const 15
    i32.add
    i32.const -16
    i32.and
    local.tee $l3
    i32.gt_u
    if $I2
      local.get $l5
      local.get $l2
      local.get $l3
      i32.sub
      i32.const 65535
      i32.add
      i32.const -65536
      i32.and
      i32.const 16
      i32.shr_u
      local.tee $l3
      local.get $l3
      local.get $l5
      i32.lt_s
      select
      memory.grow
      i32.const 0
      i32.lt_s
      if $I3
        local.get $l3
        memory.grow
        i32.const 0
        i32.lt_s
        if $I4
          unreachable
        end
      end
    end
    local.get $l2
    global.set $g0
    local.get $l6
    local.get $l7
    i32.store
    local.get $l4
    i32.const 4
    i32.sub
    local.tee $l2
    i32.const 0
    i32.store offset=4
    local.get $l2
    i32.const 0
    i32.store offset=8
    local.get $l2
    local.get $p1
    i32.store offset=12
    local.get $l2
    local.get $p0
    i32.store offset=16
    local.get $l4
    i32.const 16
    i32.add)
  (func $f6 (export "f6") (type $t4) (param $p0 i32) (param $p1 i32)
    (local $l2 i32)
    block $B0
      local.get $p1
      i32.eqz
      br_if $B0
      local.get $p0
      i32.const 0
      i32.store8
      local.get $p0
      local.get $p1
      i32.add
      local.tee $l2
      i32.const 1
      i32.sub
      i32.const 0
      i32.store8
      local.get $p1
      i32.const 2
      i32.le_u
      br_if $B0
      local.get $p0
      i32.const 0
      i32.store8 offset=1
      local.get $p0
      i32.const 0
      i32.store8 offset=2
      local.get $l2
      i32.const 2
      i32.sub
      i32.const 0
      i32.store8
      local.get $l2
      i32.const 3
      i32.sub
      i32.const 0
      i32.store8
      local.get $p1
      i32.const 6
      i32.le_u
      br_if $B0
      local.get $p0
      i32.const 0
      i32.store8 offset=3
      local.get $l2
      i32.const 4
      i32.sub
      i32.const 0
      i32.store8
      local.get $p1
      i32.const 8
      i32.le_u
      br_if $B0
      i32.const 0
      local.get $p0
      i32.sub
      i32.const 3
      i32.and
      local.tee $l2
      local.get $p0
      i32.add
      local.tee $p0
      i32.const 0
      i32.store
      local.get $p1
      local.get $l2
      i32.sub
      i32.const -4
      i32.and
      local.tee $l2
      local.get $p0
      i32.add
      local.tee $p1
      i32.const 4
      i32.sub
      i32.const 0
      i32.store
      local.get $l2
      i32.const 8
      i32.le_u
      br_if $B0
      local.get $p0
      i32.const 0
      i32.store offset=4
      local.get $p0
      i32.const 0
      i32.store offset=8
      local.get $p1
      i32.const 12
      i32.sub
      i32.const 0
      i32.store
      local.get $p1
      i32.const 8
      i32.sub
      i32.const 0
      i32.store
      local.get $l2
      i32.const 24
      i32.le_u
      br_if $B0
      local.get $p0
      i32.const 0
      i32.store offset=12
      local.get $p0
      i32.const 0
      i32.store offset=16
      local.get $p0
      i32.const 0
      i32.store offset=20
      local.get $p0
      i32.const 0
      i32.store offset=24
      local.get $p1
      i32.const 28
      i32.sub
      i32.const 0
      i32.store
      local.get $p1
      i32.const 24
      i32.sub
      i32.const 0
      i32.store
      local.get $p1
      i32.const 20
      i32.sub
      i32.const 0
      i32.store
      local.get $p1
      i32.const 16
      i32.sub
      i32.const 0
      i32.store
      local.get $p0
      i32.const 4
      i32.and
      i32.const 24
      i32.add
      local.tee $p1
      local.get $p0
      i32.add
      local.set $p0
      local.get $l2
      local.get $p1
      i32.sub
      local.set $p1
      loop $L1
        local.get $p1
        i32.const 32
        i32.ge_u
        if $I2
          local.get $p0
          i64.const 0
          i64.store
          local.get $p0
          i64.const 0
          i64.store offset=8
          local.get $p0
          i64.const 0
          i64.store offset=16
          local.get $p0
          i64.const 0
          i64.store offset=24
          local.get $p1
          i32.const 32
          i32.sub
          local.set $p1
          local.get $p0
          i32.const 32
          i32.add
          local.set $p0
          br $L1
        end
      end
    end)
  (func $f7 (export "f7") (type $t1) (param $p0 i32) (param $p1 i32) (param $p2 i32) (result i32)
    local.get $p0
    i32.eqz
    if $I0
      i32.const 12
      i32.const 3
      call $__new
      local.set $p0
    end
    local.get $p0
    i32.const 0
    i32.store
    local.get $p0
    i32.const 0
    i32.store offset=4
    local.get $p0
    i32.const 0
    i32.store offset=8
    local.get $p1
    i32.const 1073741820
    local.get $p2
    i32.shr_u
    i32.gt_u
    if $I1
      unreachable
    end
    local.get $p1
    local.get $p2
    i32.shl
    local.tee $p1
    i32.const 1
    call $__new
    local.tee $p2
    local.get $p1
    call $f6
    local.get $p0
    local.get $p2
    i32.store
    local.get $p0
    local.get $p2
    i32.store offset=4
    local.get $p0
    local.get $p1
    i32.store offset=8
    local.get $p0)
  (func $f8 (export "f8") (type $t0) (param $p0 i32) (param $p1 i32) (result i32)
    local.get $p0
    i32.eqz
    if $I0
      i32.const 12
      i32.const 7
      call $__new
      local.set $p0
    end
    local.get $p0
    if $I1 (result i32)
      local.get $p0
    else
      i32.const 12
      i32.const 8
      call $__new
    end
    local.get $p1
    i32.const 0
    call $f7)
  (func $f9 (export "f9") (type $t0) (param $p0 i32) (param $p1 i32) (result i32)
    i32.const 12
    i32.const 6
    call $__new
    i32.const 0
    call $f8)
  (func $f10 (export "f10") (type $t2) (result i32)
    (local $l0 i32)
    i32.const 0
    i32.const 4
    call $f8
    local.tee $l0
    i32.load offset=8
    i32.const 3
    i32.le_u
    if $I0
      unreachable
    end
    local.get $l0
    i32.load offset=4
    i32.const 3
    i32.add
    i32.const 0
    i32.store8
    local.get $l0
    i32.load offset=8
    i32.const 2
    i32.le_u
    if $I1
      unreachable
    end
    local.get $l0
    i32.load offset=4
    i32.const 2
    i32.add
    i32.const 0
    i32.store8
    local.get $l0
    i32.load offset=8
    i32.const 1
    i32.le_u
    if $I2
      unreachable
    end
    local.get $l0
    i32.load offset=4
    i32.const 1
    i32.add
    i32.const 0
    i32.store8
    local.get $l0
    i32.load offset=8
    i32.eqz
    if $I3
      unreachable
    end
    local.get $l0
    i32.load offset=4
    i32.const 0
    i32.store8
    local.get $l0)
  (func $f11 (export "f11") (type $t8) (param $p0 i32) (param $p1 i32) (param $p2 i32)
    (local $l3 i32) (local $l4 i32) (local $l5 i32)
    block $B0
      local.get $p0
      local.get $p1
      i32.eq
      br_if $B0
      local.get $p1
      local.get $p0
      i32.sub
      local.get $p2
      i32.sub
      i32.const 0
      local.get $p2
      i32.const 1
      i32.shl
      i32.sub
      i32.le_u
      if $I1
        local.get $p2
        local.set $l4
        loop $L2
          local.get $p1
          i32.const 3
          i32.and
          i32.const 0
          local.get $l4
          select
          if $I3
            local.get $p0
            local.tee $p2
            i32.const 1
            i32.add
            local.set $p0
            local.get $p1
            local.tee $l3
            i32.const 1
            i32.add
            local.set $p1
            local.get $p2
            local.get $l3
            i32.load8_u
            i32.store8
            local.get $l4
            i32.const 1
            i32.sub
            local.set $l4
            br $L2
          end
        end
        local.get $p0
        i32.const 3
        i32.and
        i32.eqz
        if $I4
          loop $L5
            local.get $l4
            i32.const 16
            i32.ge_u
            if $I6
              local.get $p0
              local.get $p1
              i32.load
              i32.store
              local.get $p0
              i32.const 4
              i32.add
              local.get $p1
              i32.const 4
              i32.add
              i32.load
              i32.store
              local.get $p0
              i32.const 8
              i32.add
              local.get $p1
              i32.const 8
              i32.add
              i32.load
              i32.store
              local.get $p0
              i32.const 12
              i32.add
              local.get $p1
              i32.const 12
              i32.add
              i32.load
              i32.store
              local.get $p1
              i32.const 16
              i32.add
              local.set $p1
              local.get $p0
              i32.const 16
              i32.add
              local.set $p0
              local.get $l4
              i32.const 16
              i32.sub
              local.set $l4
              br $L5
            end
          end
          local.get $l4
          i32.const 8
          i32.and
          if $I7
            local.get $p0
            local.get $p1
            i32.load
            i32.store
            local.get $p0
            i32.const 4
            i32.add
            local.get $p1
            i32.const 4
            i32.add
            i32.load
            i32.store
            local.get $p1
            i32.const 8
            i32.add
            local.set $p1
            local.get $p0
            i32.const 8
            i32.add
            local.set $p0
          end
          local.get $l4
          i32.const 4
          i32.and
          if $I8
            local.get $p0
            local.get $p1
            i32.load
            i32.store
            local.get $p1
            i32.const 4
            i32.add
            local.set $p1
            local.get $p0
            i32.const 4
            i32.add
            local.set $p0
          end
          local.get $l4
          i32.const 2
          i32.and
          if $I9
            local.get $p0
            local.get $p1
            i32.load16_u
            i32.store16
            local.get $p1
            i32.const 2
            i32.add
            local.set $p1
            local.get $p0
            i32.const 2
            i32.add
            local.set $p0
          end
          local.get $l4
          i32.const 1
          i32.and
          if $I10
            local.get $p0
            local.get $p1
            i32.load8_u
            i32.store8
          end
          br $B0
        end
        local.get $l4
        i32.const 32
        i32.ge_u
        if $I11
          block $B12
            block $B13
              block $B14
                block $B15
                  local.get $p0
                  i32.const 3
                  i32.and
                  i32.const 1
                  i32.sub
                  br_table $B15 $B14 $B13 $B12
                end
                local.get $p1
                i32.load
                local.set $l5
                local.get $p0
                local.get $p1
                i32.load8_u
                i32.store8
                local.get $p0
                i32.const 1
                i32.add
                local.tee $p0
                i32.const 1
                i32.add
                local.set $p2
                local.get $p1
                i32.const 1
                i32.add
                local.tee $p1
                i32.const 1
                i32.add
                local.set $l3
                local.get $p0
                local.get $p1
                i32.load8_u
                i32.store8
                local.get $p2
                i32.const 1
                i32.add
                local.set $p0
                local.get $l3
                i32.const 1
                i32.add
                local.set $p1
                local.get $p2
                local.get $l3
                i32.load8_u
                i32.store8
                local.get $l4
                i32.const 3
                i32.sub
                local.set $l4
                loop $L16
                  local.get $l4
                  i32.const 17
                  i32.ge_u
                  if $I17
                    local.get $p0
                    local.get $p1
                    i32.const 1
                    i32.add
                    i32.load
                    local.tee $p2
                    i32.const 8
                    i32.shl
                    local.get $l5
                    i32.const 24
                    i32.shr_u
                    i32.or
                    i32.store
                    local.get $p0
                    i32.const 4
                    i32.add
                    local.get $p1
                    i32.const 5
                    i32.add
                    i32.load
                    local.tee $l3
                    i32.const 8
                    i32.shl
                    local.get $p2
                    i32.const 24
                    i32.shr_u
                    i32.or
                    i32.store
                    local.get $p0
                    i32.const 8
                    i32.add
                    local.get $p1
                    i32.const 9
                    i32.add
                    i32.load
                    local.tee $p2
                    i32.const 8
                    i32.shl
                    local.get $l3
                    i32.const 24
                    i32.shr_u
                    i32.or
                    i32.store
                    local.get $p0
                    i32.const 12
                    i32.add
                    local.get $p1
                    i32.const 13
                    i32.add
                    i32.load
                    local.tee $l5
                    i32.const 8
                    i32.shl
                    local.get $p2
                    i32.const 24
                    i32.shr_u
                    i32.or
                    i32.store
                    local.get $p1
                    i32.const 16
                    i32.add
                    local.set $p1
                    local.get $p0
                    i32.const 16
                    i32.add
                    local.set $p0
                    local.get $l4
                    i32.const 16
                    i32.sub
                    local.set $l4
                    br $L16
                  end
                end
                br $B12
              end
              local.get $p1
              i32.load
              local.set $l5
              local.get $p0
              local.get $p1
              i32.load8_u
              i32.store8
              local.get $p0
              i32.const 1
              i32.add
              local.tee $p2
              i32.const 1
              i32.add
              local.set $p0
              local.get $p1
              i32.const 1
              i32.add
              local.tee $l3
              i32.const 1
              i32.add
              local.set $p1
              local.get $p2
              local.get $l3
              i32.load8_u
              i32.store8
              local.get $l4
              i32.const 2
              i32.sub
              local.set $l4
              loop $L18
                local.get $l4
                i32.const 18
                i32.ge_u
                if $I19
                  local.get $p0
                  local.get $p1
                  i32.const 2
                  i32.add
                  i32.load
                  local.tee $p2
                  i32.const 16
                  i32.shl
                  local.get $l5
                  i32.const 16
                  i32.shr_u
                  i32.or
                  i32.store
                  local.get $p0
                  i32.const 4
                  i32.add
                  local.get $p1
                  i32.const 6
                  i32.add
                  i32.load
                  local.tee $l3
                  i32.const 16
                  i32.shl
                  local.get $p2
                  i32.const 16
                  i32.shr_u
                  i32.or
                  i32.store
                  local.get $p0
                  i32.const 8
                  i32.add
                  local.get $p1
                  i32.const 10
                  i32.add
                  i32.load
                  local.tee $p2
                  i32.const 16
                  i32.shl
                  local.get $l3
                  i32.const 16
                  i32.shr_u
                  i32.or
                  i32.store
                  local.get $p0
                  i32.const 12
                  i32.add
                  local.get $p1
                  i32.const 14
                  i32.add
                  i32.load
                  local.tee $l5
                  i32.const 16
                  i32.shl
                  local.get $p2
                  i32.const 16
                  i32.shr_u
                  i32.or
                  i32.store
                  local.get $p1
                  i32.const 16
                  i32.add
                  local.set $p1
                  local.get $p0
                  i32.const 16
                  i32.add
                  local.set $p0
                  local.get $l4
                  i32.const 16
                  i32.sub
                  local.set $l4
                  br $L18
                end
              end
              br $B12
            end
            local.get $p1
            i32.load
            local.set $l5
            local.get $p0
            local.tee $p2
            i32.const 1
            i32.add
            local.set $p0
            local.get $p1
            local.tee $l3
            i32.const 1
            i32.add
            local.set $p1
            local.get $p2
            local.get $l3
            i32.load8_u
            i32.store8
            local.get $l4
            i32.const 1
            i32.sub
            local.set $l4
            loop $L20
              local.get $l4
              i32.const 19
              i32.ge_u
              if $I21
                local.get $p0
                local.get $p1
                i32.const 3
                i32.add
                i32.load
                local.tee $p2
                i32.const 24
                i32.shl
                local.get $l5
                i32.const 8
                i32.shr_u
                i32.or
                i32.store
                local.get $p0
                i32.const 4
                i32.add
                local.get $p1
                i32.const 7
                i32.add
                i32.load
                local.tee $l3
                i32.const 24
                i32.shl
                local.get $p2
                i32.const 8
                i32.shr_u
                i32.or
                i32.store
                local.get $p0
                i32.const 8
                i32.add
                local.get $p1
                i32.const 11
                i32.add
                i32.load
                local.tee $p2
                i32.const 24
                i32.shl
                local.get $l3
                i32.const 8
                i32.shr_u
                i32.or
                i32.store
                local.get $p0
                i32.const 12
                i32.add
                local.get $p1
                i32.const 15
                i32.add
                i32.load
                local.tee $l5
                i32.const 24
                i32.shl
                local.get $p2
                i32.const 8
                i32.shr_u
                i32.or
                i32.store
                local.get $p1
                i32.const 16
                i32.add
                local.set $p1
                local.get $p0
                i32.const 16
                i32.add
                local.set $p0
                local.get $l4
                i32.const 16
                i32.sub
                local.set $l4
                br $L20
              end
            end
          end
        end
        local.get $l4
        i32.const 16
        i32.and
        if $I22
          local.get $p0
          local.get $p1
          i32.load8_u
          i32.store8
          local.get $p0
          i32.const 1
          i32.add
          local.tee $p2
          i32.const 1
          i32.add
          local.set $p0
          local.get $p1
          i32.const 1
          i32.add
          local.tee $l3
          i32.const 1
          i32.add
          local.set $p1
          local.get $p2
          local.get $l3
          i32.load8_u
          i32.store8
          local.get $p0
          local.get $p1
          i32.load8_u
          i32.store8
          local.get $p0
          i32.const 1
          i32.add
          local.tee $p2
          i32.const 1
          i32.add
          local.set $p0
          local.get $p1
          i32.const 1
          i32.add
          local.tee $l3
          i32.const 1
          i32.add
          local.set $p1
          local.get $p2
          local.get $l3
          i32.load8_u
          i32.store8
          local.get $p0
          local.get $p1
          i32.load8_u
          i32.store8
          local.get $p0
          i32.const 1
          i32.add
          local.tee $p2
          i32.const 1
          i32.add
          local.set $p0
          local.get $p1
          i32.const 1
          i32.add
          local.tee $l3
          i32.const 1
          i32.add
          local.set $p1
          local.get $p2
          local.get $l3
          i32.load8_u
          i32.store8
          local.get $p0
          local.get $p1
          i32.load8_u
          i32.store8
          local.get $p0
          i32.const 1
          i32.add
          local.tee $p2
          i32.const 1
          i32.add
          local.set $p0
          local.get $p1
          i32.const 1
          i32.add
          local.tee $l3
          i32.const 1
          i32.add
          local.set $p1
          local.get $p2
          local.get $l3
          i32.load8_u
          i32.store8
          local.get $p0
          local.get $p1
          i32.load8_u
          i32.store8
          local.get $p0
          i32.const 1
          i32.add
          local.tee $p2
          i32.const 1
          i32.add
          local.set $p0
          local.get $p1
          i32.const 1
          i32.add
          local.tee $l3
          i32.const 1
          i32.add
          local.set $p1
          local.get $p2
          local.get $l3
          i32.load8_u
          i32.store8
          local.get $p0
          local.get $p1
          i32.load8_u
          i32.store8
          local.get $p0
          i32.const 1
          i32.add
          local.tee $p2
          i32.const 1
          i32.add
          local.set $p0
          local.get $p1
          i32.const 1
          i32.add
          local.tee $l3
          i32.const 1
          i32.add
          local.set $p1
          local.get $p2
          local.get $l3
          i32.load8_u
          i32.store8
          local.get $p0
          local.get $p1
          i32.load8_u
          i32.store8
          local.get $p0
          i32.const 1
          i32.add
          local.tee $p2
          i32.const 1
          i32.add
          local.set $p0
          local.get $p1
          i32.const 1
          i32.add
          local.tee $l3
          i32.const 1
          i32.add
          local.set $p1
          local.get $p2
          local.get $l3
          i32.load8_u
          i32.store8
          local.get $p0
          local.get $p1
          i32.load8_u
          i32.store8
          local.get $p0
          i32.const 1
          i32.add
          local.tee $p2
          i32.const 1
          i32.add
          local.set $p0
          local.get $p1
          i32.const 1
          i32.add
          local.tee $l3
          i32.const 1
          i32.add
          local.set $p1
          local.get $p2
          local.get $l3
          i32.load8_u
          i32.store8
        end
        local.get $l4
        i32.const 8
        i32.and
        if $I23
          local.get $p0
          local.get $p1
          i32.load8_u
          i32.store8
          local.get $p0
          i32.const 1
          i32.add
          local.tee $p2
          i32.const 1
          i32.add
          local.set $p0
          local.get $p1
          i32.const 1
          i32.add
          local.tee $l3
          i32.const 1
          i32.add
          local.set $p1
          local.get $p2
          local.get $l3
          i32.load8_u
          i32.store8
          local.get $p0
          local.get $p1
          i32.load8_u
          i32.store8
          local.get $p0
          i32.const 1
          i32.add
          local.tee $p2
          i32.const 1
          i32.add
          local.set $p0
          local.get $p1
          i32.const 1
          i32.add
          local.tee $l3
          i32.const 1
          i32.add
          local.set $p1
          local.get $p2
          local.get $l3
          i32.load8_u
          i32.store8
          local.get $p0
          local.get $p1
          i32.load8_u
          i32.store8
          local.get $p0
          i32.const 1
          i32.add
          local.tee $p2
          i32.const 1
          i32.add
          local.set $p0
          local.get $p1
          i32.const 1
          i32.add
          local.tee $l3
          i32.const 1
          i32.add
          local.set $p1
          local.get $p2
          local.get $l3
          i32.load8_u
          i32.store8
          local.get $p0
          local.get $p1
          i32.load8_u
          i32.store8
          local.get $p0
          i32.const 1
          i32.add
          local.tee $p2
          i32.const 1
          i32.add
          local.set $p0
          local.get $p1
          i32.const 1
          i32.add
          local.tee $l3
          i32.const 1
          i32.add
          local.set $p1
          local.get $p2
          local.get $l3
          i32.load8_u
          i32.store8
        end
        local.get $l4
        i32.const 4
        i32.and
        if $I24
          local.get $p0
          local.get $p1
          i32.load8_u
          i32.store8
          local.get $p0
          i32.const 1
          i32.add
          local.tee $p2
          i32.const 1
          i32.add
          local.set $p0
          local.get $p1
          i32.const 1
          i32.add
          local.tee $l3
          i32.const 1
          i32.add
          local.set $p1
          local.get $p2
          local.get $l3
          i32.load8_u
          i32.store8
          local.get $p0
          local.get $p1
          i32.load8_u
          i32.store8
          local.get $p0
          i32.const 1
          i32.add
          local.tee $p2
          i32.const 1
          i32.add
          local.set $p0
          local.get $p1
          i32.const 1
          i32.add
          local.tee $l3
          i32.const 1
          i32.add
          local.set $p1
          local.get $p2
          local.get $l3
          i32.load8_u
          i32.store8
        end
        local.get $l4
        i32.const 2
        i32.and
        if $I25
          local.get $p0
          local.get $p1
          i32.load8_u
          i32.store8
          local.get $p0
          i32.const 1
          i32.add
          local.tee $p2
          i32.const 1
          i32.add
          local.set $p0
          local.get $p1
          i32.const 1
          i32.add
          local.tee $l3
          i32.const 1
          i32.add
          local.set $p1
          local.get $p2
          local.get $l3
          i32.load8_u
          i32.store8
        end
        local.get $l4
        i32.const 1
        i32.and
        if $I26
          local.get $p0
          local.get $p1
          i32.load8_u
          i32.store8
        end
        br $B0
      end
      local.get $p0
      local.get $p1
      i32.lt_u
      if $I27
        local.get $p1
        i32.const 7
        i32.and
        local.get $p0
        i32.const 7
        i32.and
        i32.eq
        if $I28
          loop $L29
            local.get $p0
            i32.const 7
            i32.and
            if $I30
              local.get $p2
              i32.eqz
              br_if $B0
              local.get $p2
              i32.const 1
              i32.sub
              local.set $p2
              local.get $p0
              local.tee $l3
              i32.const 1
              i32.add
              local.set $p0
              local.get $p1
              local.tee $l4
              i32.const 1
              i32.add
              local.set $p1
              local.get $l3
              local.get $l4
              i32.load8_u
              i32.store8
              br $L29
            end
          end
          loop $L31
            local.get $p2
            i32.const 8
            i32.ge_u
            if $I32
              local.get $p0
              local.get $p1
              i64.load
              i64.store
              local.get $p2
              i32.const 8
              i32.sub
              local.set $p2
              local.get $p0
              i32.const 8
              i32.add
              local.set $p0
              local.get $p1
              i32.const 8
              i32.add
              local.set $p1
              br $L31
            end
          end
        end
        loop $L33
          local.get $p2
          if $I34
            local.get $p0
            local.tee $l3
            i32.const 1
            i32.add
            local.set $p0
            local.get $p1
            local.tee $l4
            i32.const 1
            i32.add
            local.set $p1
            local.get $l3
            local.get $l4
            i32.load8_u
            i32.store8
            local.get $p2
            i32.const 1
            i32.sub
            local.set $p2
            br $L33
          end
        end
      else
        local.get $p1
        i32.const 7
        i32.and
        local.get $p0
        i32.const 7
        i32.and
        i32.eq
        if $I35
          loop $L36
            local.get $p0
            local.get $p2
            i32.add
            i32.const 7
            i32.and
            if $I37
              local.get $p2
              i32.eqz
              br_if $B0
              local.get $p0
              local.get $p2
              i32.const 1
              i32.sub
              local.tee $p2
              i32.add
              local.get $p1
              local.get $p2
              i32.add
              i32.load8_u
              i32.store8
              br $L36
            end
          end
          loop $L38
            local.get $p2
            i32.const 8
            i32.ge_u
            if $I39
              local.get $p0
              local.get $p2
              i32.const 8
              i32.sub
              local.tee $p2
              i32.add
              local.get $p1
              local.get $p2
              i32.add
              i64.load
              i64.store
              br $L38
            end
          end
        end
        loop $L40
          local.get $p2
          if $I41
            local.get $p0
            local.get $p2
            i32.const 1
            i32.sub
            local.tee $p2
            i32.add
            local.get $p1
            local.get $p2
            i32.add
            i32.load8_u
            i32.store8
            br $L40
          end
        end
      end
    end)
  (func $f12 (export "f12") (type $t8) (param $p0 i32) (param $p1 i32) (param $p2 i32)
    (local $l3 i32)
    local.get $p1
    i32.load offset=8
    local.set $l3
    local.get $p2
    i32.const 0
    i32.lt_s
    if $I0 (result i32)
      i32.const 1
    else
      local.get $p0
      i32.load offset=8
      local.get $p2
      local.get $l3
      i32.add
      i32.lt_s
    end
    if $I1
      unreachable
    end
    local.get $p0
    i32.load offset=4
    local.get $p2
    i32.add
    local.get $p1
    i32.load offset=4
    local.get $l3
    call $f11)
  (func $f13 (export "f13") (type $t0) (param $p0 i32) (param $p1 i32) (result i32)
    (local $l2 i32)
    i32.const 0
    local.get $p0
    i32.load offset=8
    local.get $p1
    i32.load offset=8
    i32.add
    call $f8
    local.tee $l2
    local.get $p0
    i32.const 0
    call $f12
    local.get $l2
    local.get $p1
    local.get $p0
    i32.load offset=8
    call $f12
    local.get $l2)
  (func $f14 (export "f14") (type $t0) (param $p0 i32) (param $p1 i32) (result i32)
    local.get $p0
    i32.load offset=12
    i32.eqz
    if $I0
      unreachable
    end
    local.get $p0
    i32.load offset=4
    i32.load
    local.tee $p0
    i32.eqz
    if $I1
      unreachable
    end
    local.get $p0
    i32.load
    local.tee $p0
    i32.load offset=12
    i32.eqz
    if $I2
      unreachable
    end
    local.get $p0
    i32.load offset=4
    i32.load
    local.tee $p0
    i32.eqz
    if $I3
      unreachable
    end
    local.get $p0
    i32.load
    call $f10
    call $f13
    local.get $p1
    i32.load offset=12
    i32.eqz
    if $I4
      unreachable
    end
    local.get $p1
    i32.load offset=4
    i32.load
    local.tee $p1
    i32.eqz
    if $I5
      unreachable
    end
    local.get $p1
    i32.load
    local.tee $p1
    i32.load offset=12
    i32.eqz
    if $I6
      unreachable
    end
    local.get $p1
    i32.load offset=4
    i32.load
    local.tee $p1
    i32.eqz
    if $I7
      unreachable
    end
    local.get $p1
    i32.load
    call $f13)
  (func $f15 (export "f15") (type $t2) (result i32)
    i32.const 16
    call $f36)
  (func $f16 (export "f16") (type $t2) (result i32)
    i32.const 9
    call $f36)
  (func $f17 (export "f17") (type $t11) (param $p0 i64) (result i32)
    (local $l1 i32) (local $l2 i32) (local $l3 i32)
    i32.const 24
    i32.const 4
    call $__new
    local.tee $l3
    local.get $p0
    i64.store offset=16
    local.get $l3
    i32.const 9
    call $f36
    i32.store
    i32.const 16
    i32.const 13
    call $__new
    local.tee $l1
    i32.const 0
    i32.store
    local.get $l1
    i32.const 0
    i32.store offset=4
    local.get $l1
    i32.const 0
    i32.store offset=8
    local.get $l1
    i32.const 0
    i32.store offset=12
    i32.const 32
    i32.const 1
    call $__new
    local.tee $l2
    i32.const 32
    call $f6
    local.get $l1
    local.get $l2
    i32.store
    local.get $l1
    local.get $l2
    i32.store offset=4
    local.get $l1
    i32.const 32
    i32.store offset=8
    local.get $l1
    i32.const 0
    i32.store offset=12
    local.get $l3
    local.get $l1
    i32.store offset=4
    i32.const 16
    i32.const 15
    call $__new
    local.tee $l1
    i32.const 0
    i32.store
    local.get $l1
    i32.const 0
    i32.store offset=4
    local.get $l1
    i32.const 0
    i32.store offset=8
    local.get $l1
    i32.const 0
    i32.store offset=12
    i32.const 32
    i32.const 1
    call $__new
    local.tee $l2
    i32.const 32
    call $f6
    local.get $l1
    local.get $l2
    i32.store
    local.get $l1
    local.get $l2
    i32.store offset=4
    local.get $l1
    i32.const 32
    i32.store offset=8
    local.get $l1
    i32.const 0
    i32.store offset=12
    local.get $l3
    local.get $l1
    i32.store offset=8
    local.get $l3)
  (func $f18 (export "f18") (type $t12) (param $p0 i32) (param $p1 i32) (param $p2 i32) (param $p3 i32)
    (local $l4 i32) (local $l5 i32) (local $l6 i64)
    loop $L0
      local.get $l4
      i32.const 3
      i32.shl
      local.tee $l5
      local.get $p1
      i32.lt_s
      if $I1
        local.get $l5
        i32.const 8
        i32.add
        local.get $p1
        i32.lt_s
        if $I2
          local.get $p2
          call $env.wasm_input
          local.set $l6
          local.get $l4
          local.get $p0
          i32.load offset=8
          i32.const 3
          i32.shr_u
          i32.ge_u
          if $I3
            unreachable
          end
          local.get $p0
          i32.load offset=4
          local.get $l4
          i32.const 3
          i32.shl
          i32.add
          local.get $l6
          i64.store
          local.get $p3
          if $I4
            local.get $l4
            local.get $p0
            i32.load offset=8
            i32.const 3
            i32.shr_u
            i32.ge_u
            if $I5
              unreachable
            end
            local.get $p0
            i32.load offset=4
            local.get $l4
            i32.const 3
            i32.shl
            i32.add
            i64.load
            call $env.wasm_write_context
          end
        else
          local.get $p2
          call $env.wasm_input
          local.set $l6
          local.get $p3
          if $I6
            local.get $l6
            call $env.wasm_write_context
          end
          local.get $l4
          i32.const 3
          i32.shl
          local.set $l5
          loop $L7
            local.get $p1
            local.get $l5
            i32.gt_s
            if $I8
              local.get $l5
              local.get $p0
              i32.load offset=8
              i32.ge_u
              if $I9
                unreachable
              end
              local.get $p0
              i32.load offset=4
              local.get $l5
              i32.add
              local.get $l6
              i64.store8
              local.get $l6
              i64.const 8
              i64.shr_s
              local.set $l6
              local.get $l5
              i32.const 1
              i32.add
              local.set $l5
              br $L7
            end
          end
        end
        local.get $l4
        i32.const 1
        i32.add
        local.set $l4
        br $L0
      end
    end)
  (func $f19 (export "f19") (type $t3) (param $p0 i32) (result i32)
    (local $l1 i32) (local $l2 i32)
    i32.const 0
    call $env.wasm_input
    i32.wrap_i64
    local.set $l1
    local.get $p0
    if $I0
      local.get $l1
      i64.extend_i32_s
      call $env.wasm_write_context
    end
    i32.const 12
    i32.const 6
    call $__new
    local.get $l1
    call $f8
    local.tee $l2
    local.get $l1
    i32.const 0
    local.get $p0
    call $f18
    local.get $l2)
  (func $f20 (export "f20") (type $t0) (param $p0 i32) (param $p1 i32) (result i32)
    (local $l2 i32)
    i32.const 16
    i32.const 10
    call $__new
    local.tee $l2
    local.get $p0
    i32.store offset=8
    local.get $l2
    local.get $p1
    i32.store offset=12
    local.get $l2
    i32.const 9
    call $f36
    i32.store
    i32.const 16
    i32.const 12
    call $__new
    local.tee $p0
    i32.const 0
    i32.store
    local.get $p0
    i32.const 0
    i32.store offset=4
    local.get $p0
    i32.const 0
    i32.store offset=8
    local.get $p0
    i32.const 0
    i32.store offset=12
    i32.const 32
    i32.const 1
    call $__new
    local.tee $p1
    i32.const 32
    call $f6
    local.get $p0
    local.get $p1
    i32.store
    local.get $p0
    local.get $p1
    i32.store offset=4
    local.get $p0
    i32.const 32
    i32.store offset=8
    local.get $p0
    i32.const 0
    i32.store offset=12
    local.get $l2
    local.get $p0
    i32.store offset=4
    local.get $l2)
  (func $f21 (export "f21") (type $t4) (param $p0 i32) (param $p1 i32)
    (local $l2 i32) (local $l3 i32) (local $l4 i32) (local $l5 i32) (local $l6 i32) (local $l7 i32) (local $l8 i32) (local $l9 i32) (local $l10 i32) (local $l11 i32) (local $l12 i32) (local $l13 i32) (local $l14 i32)
    local.get $p0
    i32.load offset=12
    local.tee $l14
    i32.const 1
    i32.add
    local.tee $l6
    local.get $p0
    i32.load offset=8
    local.tee $l11
    i32.const 2
    i32.shr_u
    i32.gt_u
    if $I0
      local.get $l6
      i32.const 268435455
      i32.gt_u
      if $I1
        unreachable
      end
      local.get $p0
      i32.load
      local.set $l12
      i32.const 1073741820
      local.get $l11
      i32.const 1
      i32.shl
      local.tee $l2
      local.get $l2
      i32.const 1073741820
      i32.ge_u
      select
      local.tee $l4
      i32.const 8
      local.get $l6
      local.get $l6
      i32.const 8
      i32.le_u
      select
      i32.const 2
      i32.shl
      local.tee $l2
      local.get $l2
      local.get $l4
      i32.lt_u
      select
      local.tee $l7
      i32.const 1073741804
      i32.gt_u
      if $I2
        unreachable
      end
      local.get $l12
      i32.const 16
      i32.sub
      local.tee $l4
      i32.const 4
      i32.sub
      local.tee $l8
      i32.load
      local.set $l9
      global.get $g0
      local.get $l4
      local.get $l9
      i32.add
      i32.eq
      local.set $l3
      local.get $l7
      i32.const 16
      i32.add
      local.tee $l2
      i32.const 19
      i32.add
      i32.const -16
      i32.and
      i32.const 4
      i32.sub
      local.set $l5
      local.get $l2
      local.get $l9
      i32.gt_u
      if $I3
        local.get $l3
        if $I4
          local.get $l2
          i32.const 1073741820
          i32.gt_u
          if $I5
            unreachable
          end
          local.get $l4
          local.get $l5
          i32.add
          local.tee $l10
          memory.size
          local.tee $l3
          i32.const 16
          i32.shl
          i32.const 15
          i32.add
          i32.const -16
          i32.and
          local.tee $l2
          i32.gt_u
          if $I6
            local.get $l3
            local.get $l10
            local.get $l2
            i32.sub
            i32.const 65535
            i32.add
            i32.const -65536
            i32.and
            i32.const 16
            i32.shr_u
            local.tee $l2
            local.get $l2
            local.get $l3
            i32.lt_s
            select
            memory.grow
            i32.const 0
            i32.lt_s
            if $I7
              local.get $l2
              memory.grow
              i32.const 0
              i32.lt_s
              if $I8
                unreachable
              end
            end
          end
          local.get $l10
          global.set $g0
          local.get $l8
          local.get $l5
          i32.store
        else
          local.get $l5
          local.get $l9
          i32.const 1
          i32.shl
          local.tee $l2
          local.get $l2
          local.get $l5
          i32.lt_u
          select
          local.tee $l3
          i32.const 1073741820
          i32.gt_u
          if $I9
            unreachable
          end
          global.get $g0
          local.tee $l8
          i32.const 4
          i32.add
          local.tee $l2
          local.get $l3
          i32.const 19
          i32.add
          i32.const -16
          i32.and
          i32.const 4
          i32.sub
          local.tee $l10
          i32.add
          local.tee $l13
          memory.size
          local.tee $l5
          i32.const 16
          i32.shl
          i32.const 15
          i32.add
          i32.const -16
          i32.and
          local.tee $l3
          i32.gt_u
          if $I10
            local.get $l5
            local.get $l13
            local.get $l3
            i32.sub
            i32.const 65535
            i32.add
            i32.const -65536
            i32.and
            i32.const 16
            i32.shr_u
            local.tee $l3
            local.get $l3
            local.get $l5
            i32.lt_s
            select
            memory.grow
            i32.const 0
            i32.lt_s
            if $I11
              local.get $l3
              memory.grow
              i32.const 0
              i32.lt_s
              if $I12
                unreachable
              end
            end
          end
          local.get $l13
          global.set $g0
          local.get $l8
          local.get $l10
          i32.store
          local.get $l2
          local.get $l4
          local.get $l9
          call $f11
          local.get $l2
          local.set $l4
        end
      else
        local.get $l3
        if $I13
          local.get $l4
          local.get $l5
          i32.add
          global.set $g0
          local.get $l8
          local.get $l5
          i32.store
        end
      end
      local.get $l4
      i32.const 4
      i32.sub
      local.get $l7
      i32.store offset=16
      local.get $l4
      i32.const 16
      i32.add
      local.tee $l2
      local.get $l11
      i32.add
      local.get $l7
      local.get $l11
      i32.sub
      call $f6
      local.get $l2
      local.get $l12
      i32.ne
      if $I14
        local.get $p0
        local.get $l2
        i32.store
        local.get $p0
        local.get $l2
        i32.store offset=4
      end
      local.get $p0
      local.get $l7
      i32.store offset=8
    end
    local.get $p0
    i32.load offset=4
    local.get $l14
    i32.const 2
    i32.shl
    i32.add
    local.get $p1
    i32.store
    local.get $p0
    local.get $l6
    i32.store offset=12)
  (func $__pin (export "__pin") (type $t3) (param $p0 i32) (result i32)
    local.get $p0)
  (func $f23 (export "f23") (type $t0) (param $p0 i32) (param $p1 i32) (result i32)
    (local $l2 i32)
    i32.const 12
    i32.const 8
    call $__new
    i32.const 0
    i32.const 0
    call $f7
    local.tee $l2
    local.get $p0
    i32.store
    local.get $l2
    i32.const 4
    i32.add
    local.get $p0
    i32.store
    local.get $l2
    i32.const 8
    i32.add
    local.get $p1
    i32.store
    local.get $l2)
  (func $f24 (export "f24") (type $t1) (param $p0 i32) (param $p1 i32) (param $p2 i32) (result i32)
    (local $l3 i32) (local $l4 i32) (local $l5 i32) (local $l6 i32) (local $l7 i32) (local $l8 i32) (local $l9 i32) (local $l10 i32) (local $l11 i32)
    i32.const 9
    call $f36
    local.set $l9
    loop $L0
      local.get $p1
      local.get $l4
      i32.gt_s
      if $I1
        local.get $p0
        local.get $p2
        local.get $l4
        i32.const 28
        i32.mul
        i32.add
        local.tee $l3
        i32.load
        i32.add
        i32.const 20
        call $f23
        local.set $l10
        local.get $p0
        local.get $l3
        i32.const 4
        i32.add
        i32.load
        i32.add
        i32.const 32
        call $f23
        local.set $l11
        local.get $l3
        i32.const 8
        i32.add
        i32.load
        local.tee $l5
        if $I2 (result i32)
          local.get $p0
          local.get $l5
          i32.add
          i32.const 32
          call $f23
        else
          i32.const 12
          i32.const 6
          call $__new
          i32.const 0
          call $f8
        end
        local.set $l5
        local.get $l3
        i32.const 12
        i32.add
        i32.load
        local.tee $l6
        if $I3 (result i32)
          local.get $p0
          local.get $l6
          i32.add
          i32.const 32
          call $f23
        else
          i32.const 12
          i32.const 6
          call $__new
          i32.const 0
          call $f8
        end
        local.set $l6
        local.get $l3
        i32.const 16
        i32.add
        i32.load
        local.tee $l7
        if $I4 (result i32)
          local.get $p0
          local.get $l7
          i32.add
          i32.const 32
          call $f23
        else
          i32.const 12
          i32.const 6
          call $__new
          i32.const 0
          call $f8
        end
        local.set $l7
        local.get $l3
        i32.const 20
        i32.add
        i32.load
        local.tee $l8
        if $I5 (result i32)
          local.get $p0
          local.get $l8
          i32.add
          local.get $l3
          i32.const 24
          i32.add
          i32.load
          call $f23
        else
          i32.const 12
          i32.const 6
          call $__new
          i32.const 0
          call $f8
        end
        local.set $l8
        i32.const 24
        i32.const 5
        call $__new
        local.tee $l3
        local.get $l10
        i32.store
        local.get $l3
        local.get $l11
        i32.store offset=4
        local.get $l3
        local.get $l5
        i32.store offset=8
        local.get $l3
        local.get $l6
        i32.store offset=12
        local.get $l3
        local.get $l7
        i32.store offset=16
        local.get $l3
        local.get $l8
        i32.store offset=20
        local.get $l9
        local.get $l3
        call $f21
        local.get $l4
        i32.const 1
        i32.add
        local.set $l4
        br $L0
      end
    end
    local.get $l9)
  (func $f25 (export "f25") (type $t1) (param $p0 i32) (param $p1 i32) (param $p2 i32) (result i32)
    (local $l3 i32) (local $l4 i32)
    local.get $p2
    if $I0
      loop $L1
        local.get $l3
        local.get $p0
        i32.load offset=8
        local.tee $p2
        i32.lt_s
        if $I2 (result i32)
          local.get $p2
          local.get $l3
          i32.le_u
          if $I3
            unreachable
          end
          local.get $p0
          i32.load offset=4
          local.get $l3
          i32.add
          i32.load8_u
          i32.eqz
        else
          i32.const 0
        end
        if $I4
          local.get $l3
          i32.const 1
          i32.add
          local.set $l3
          br $L1
        end
      end
      loop $L5
        local.get $l4
        local.get $p1
        i32.load offset=8
        local.tee $p2
        i32.lt_s
        if $I6 (result i32)
          local.get $p2
          local.get $l4
          i32.le_u
          if $I7
            unreachable
          end
          local.get $p1
          i32.load offset=4
          local.get $l4
          i32.add
          i32.load8_u
          i32.eqz
        else
          i32.const 0
        end
        if $I8
          local.get $l4
          i32.const 1
          i32.add
          local.set $l4
          br $L5
        end
      end
    end
    local.get $p0
    i32.load offset=8
    local.get $l3
    i32.sub
    local.get $p1
    i32.load offset=8
    local.get $l4
    i32.sub
    i32.ne
    if $I9
      i32.const 0
      return
    end
    local.get $l4
    local.get $l3
    i32.sub
    local.set $p2
    loop $L10
      local.get $l3
      local.get $p0
      i32.load offset=8
      local.tee $l4
      i32.lt_s
      if $I11
        local.get $l3
        local.get $l4
        i32.ge_u
        if $I12
          unreachable
        end
        local.get $p2
        local.get $l3
        i32.add
        local.tee $l4
        local.get $p1
        i32.load offset=8
        i32.ge_u
        if $I13
          unreachable
        end
        local.get $p0
        i32.load offset=4
        local.get $l3
        i32.add
        i32.load8_u
        local.get $p1
        i32.load offset=4
        local.get $l4
        i32.add
        i32.load8_u
        i32.ne
        if $I14
          i32.const 0
          return
        end
        local.get $l3
        i32.const 1
        i32.add
        local.set $l3
        br $L10
      end
    end
    i32.const 1)
  (func $f26 (export "f26") (type $t4) (param $p0 i32) (param $p1 i32)
    (local $l2 i32) (local $l3 i32) (local $l4 i32) (local $l5 i32) (local $l6 i32)
    loop $L0
      local.get $l4
      local.get $p1
      i32.load offset=12
      local.tee $l2
      i32.lt_s
      if $I1
        local.get $l2
        local.get $l4
        i32.le_u
        if $I2
          unreachable
        end
        local.get $p1
        i32.load offset=4
        local.get $l4
        i32.const 2
        i32.shl
        i32.add
        i32.load
        local.tee $l6
        i32.eqz
        if $I3
          unreachable
        end
        local.get $p0
        i32.load
        local.get $l6
        call $f21
        i32.const 0
        local.set $l2
        local.get $l6
        i32.load
        local.set $l5
        loop $L4
          local.get $l2
          local.get $p0
          i32.load offset=4
          local.tee $l3
          i32.load offset=12
          i32.lt_s
          if $I5
            block $B6
              local.get $l2
              local.get $l3
              i32.load offset=12
              i32.ge_u
              if $I7
                unreachable
              end
              local.get $l3
              i32.load offset=4
              local.get $l2
              i32.const 2
              i32.shl
              i32.add
              i32.load
              local.tee $l3
              i32.eqz
              if $I8
                unreachable
              end
              local.get $l3
              i32.load offset=8
              local.get $l5
              i32.const 1
              call $f25
              br_if $B6
              local.get $l2
              i32.const 1
              i32.add
              local.set $l2
              br $L4
            end
          end
        end
        i32.const -1
        local.get $l2
        local.get $l2
        local.get $p0
        i32.load offset=4
        local.tee $l3
        i32.load offset=12
        i32.eq
        select
        local.tee $l2
        i32.const -1
        i32.eq
        if $I9
          local.get $l3
          local.get $l5
          i32.const 12
          i32.const 6
          call $__new
          i32.const 0
          call $f8
          call $f20
          call $f21
          local.get $p0
          i32.load offset=4
          i32.load offset=12
          i32.const 1
          i32.sub
          local.set $l2
        end
        local.get $p0
        i32.load offset=4
        local.tee $l5
        i32.load offset=12
        local.get $l2
        i32.le_u
        if $I10
          unreachable
        end
        local.get $l5
        i32.load offset=4
        local.get $l2
        i32.const 2
        i32.shl
        i32.add
        i32.load
        local.tee $l2
        i32.eqz
        if $I11
          unreachable
        end
        local.get $l2
        i32.load
        local.get $l6
        call $f21
        local.get $l4
        i32.const 1
        i32.add
        local.set $l4
        br $L0
      end
    end)
  (func $f27 (export "f27") (type $t1) (param $p0 i32) (param $p1 i32) (param $p2 i32) (result i32)
    (local $l3 i32)
    block $B0
      local.get $p0
      i32.load offset=8
      local.tee $l3
      i32.eqz
      br_if $B0
      local.get $l3
      local.get $p2
      local.get $p2
      i32.const -1
      i32.eq
      select
      local.tee $l3
      local.get $p1
      i32.le_s
      br_if $B0
      local.get $p0
      i32.load offset=8
      local.set $p2
      local.get $p1
      i32.const 0
      i32.lt_s
      if $I1 (result i32)
        local.get $p1
        local.get $p2
        i32.add
        local.tee $p1
        i32.const 0
        local.get $p1
        i32.const 0
        i32.gt_s
        select
      else
        local.get $p1
        local.get $p2
        local.get $p1
        local.get $p2
        i32.lt_s
        select
      end
      local.set $p1
      i32.const 12
      i32.const 8
      call $__new
      local.get $l3
      i32.const 0
      i32.lt_s
      if $I2 (result i32)
        local.get $p2
        local.get $l3
        i32.add
        local.tee $p2
        i32.const 0
        local.get $p2
        i32.const 0
        i32.gt_s
        select
      else
        local.get $l3
        local.get $p2
        local.get $p2
        local.get $l3
        i32.gt_s
        select
      end
      local.get $p1
      i32.sub
      local.tee $p2
      i32.const 0
      local.get $p2
      i32.const 0
      i32.gt_s
      select
      local.tee $p2
      i32.const 0
      call $f7
      local.tee $l3
      i32.load offset=4
      local.get $p0
      i32.load offset=4
      local.get $p1
      i32.add
      local.get $p2
      call $f11
      local.get $l3
      return
    end
    call $f10)
  (func $f28 (export "f28") (type $t3) (param $p0 i32) (result i32)
    (local $l1 i32) (local $l2 i32) (local $l3 i32) (local $l4 i32)
    local.get $p0
    i32.load offset=8
    local.tee $l1
    i32.const 0
    i32.gt_s
    local.tee $l2
    if $I0
      local.get $l1
      local.get $l1
      i32.const 1
      i32.sub
      local.tee $l2
      i32.le_u
      if $I1
        unreachable
      end
      local.get $p0
      i32.load offset=4
      local.get $l2
      i32.add
      i32.load8_u
      i32.const 7
      i32.shr_u
      local.set $l2
    end
    i32.const 4
    local.set $l1
    loop $L2
      local.get $l1
      local.get $p0
      i32.load offset=8
      local.tee $l4
      i32.lt_s
      if $I3
        local.get $l1
        local.get $l4
        i32.ge_u
        if $I4
          unreachable
        end
        local.get $p0
        i32.load offset=4
        local.get $l1
        i32.add
        i32.load8_u
        drop
        local.get $l1
        i32.const 1
        i32.add
        local.set $l1
        br $L2
      end
    end
    i32.const 12
    i32.const 6
    call $__new
    i32.const 4
    call $f8
    local.tee $l1
    i32.load offset=8
    i32.eqz
    if $I5
      unreachable
    end
    local.get $l1
    i32.load offset=4
    i32.const 255
    i32.const 0
    local.get $l2
    select
    local.tee $l2
    i32.store8
    local.get $l1
    i32.load offset=8
    i32.const 1
    i32.le_u
    if $I6
      unreachable
    end
    local.get $l1
    i32.load offset=4
    i32.const 1
    i32.add
    local.get $l2
    i32.store8
    local.get $l1
    i32.load offset=8
    i32.const 2
    i32.le_u
    if $I7
      unreachable
    end
    local.get $l1
    i32.load offset=4
    i32.const 2
    i32.add
    local.get $l2
    i32.store8
    local.get $l1
    i32.load offset=8
    i32.const 3
    i32.le_u
    if $I8
      unreachable
    end
    local.get $l1
    i32.load offset=4
    i32.const 3
    i32.add
    local.get $l2
    i32.store8
    local.get $l1
    local.get $p0
    local.get $l1
    i32.load offset=8
    local.get $p0
    i32.load offset=8
    i32.lt_s
    select
    i32.load offset=8
    local.set $l2
    loop $L9
      local.get $l2
      local.get $l3
      i32.gt_s
      if $I10
        local.get $l3
        local.get $p0
        i32.load offset=8
        i32.ge_u
        if $I11
          unreachable
        end
        local.get $p0
        i32.load offset=4
        local.get $l3
        i32.add
        i32.load8_u
        local.set $l4
        local.get $l3
        local.get $l1
        i32.load offset=8
        i32.ge_u
        if $I12
          unreachable
        end
        local.get $l1
        i32.load offset=4
        local.get $l3
        i32.add
        local.get $l4
        i32.store8
        local.get $l3
        i32.const 1
        i32.add
        local.set $l3
        br $L9
      end
    end
    local.get $l1
    i32.load offset=8
    i32.const 3
    i32.le_u
    if $I13
      unreachable
    end
    local.get $l1
    i32.load offset=4
    i32.const 3
    i32.add
    i32.load8_u
    i32.const 8
    i32.shl
    local.set $p0
    local.get $l1
    i32.load offset=8
    i32.const 2
    i32.le_u
    if $I14
      unreachable
    end
    local.get $l1
    i32.load offset=4
    i32.const 2
    i32.add
    i32.load8_u
    local.get $p0
    i32.or
    i32.const 8
    i32.shl
    local.set $p0
    local.get $l1
    i32.load offset=8
    i32.const 1
    i32.le_u
    if $I15
      unreachable
    end
    local.get $l1
    i32.load offset=4
    i32.const 1
    i32.add
    i32.load8_u
    local.get $p0
    i32.or
    i32.const 8
    i32.shl
    local.set $p0
    local.get $l1
    i32.load offset=8
    i32.eqz
    if $I16
      unreachable
    end
    local.get $l1
    i32.load offset=4
    i32.load8_u
    local.get $p0
    i32.or)
  (func $f29 (export "f29") (type $t7) (param $p0 i32) (param $p1 i32) (param $p2 i32) (param $p3 i32) (result i32)
    (local $l4 i32) (local $l5 i32) (local $l6 i32) (local $l7 i32)
    local.get $p3
    i32.load offset=8
    i32.const 2
    i32.shr_u
    i32.eqz
    if $I0
      unreachable
    end
    local.get $p3
    i32.load offset=8
    i32.const 2
    i32.shr_u
    i32.eqz
    if $I1
      unreachable
    end
    local.get $p3
    i32.load offset=8
    i32.const 2
    i32.shr_u
    i32.const 1
    i32.le_u
    if $I2
      unreachable
    end
    local.get $p2
    local.get $p3
    i32.load offset=4
    local.tee $l4
    i32.load
    local.tee $l5
    local.get $l5
    local.get $l4
    i32.const 4
    i32.add
    i32.load
    i32.add
    call $f27
    call $f28
    local.set $l7
    call $f10
    local.set $l4
    local.get $p3
    i32.load offset=8
    i32.const 2
    i32.shr_u
    i32.const 2
    i32.le_u
    if $I3
      unreachable
    end
    local.get $p3
    i32.load offset=4
    i32.const 8
    i32.add
    i32.load
    if $I4
      local.get $p3
      i32.load offset=8
      i32.const 2
      i32.shr_u
      i32.const 2
      i32.le_u
      if $I5
        unreachable
      end
      local.get $p3
      i32.load offset=8
      i32.const 2
      i32.shr_u
      i32.const 2
      i32.le_u
      if $I6
        unreachable
      end
      local.get $p2
      local.get $p3
      i32.load offset=4
      i32.const 8
      i32.add
      i32.load
      local.tee $l4
      local.get $l4
      i32.const 20
      i32.add
      call $f27
      local.set $l4
    end
    call $f10
    local.set $l5
    local.get $p3
    i32.load offset=8
    i32.const 2
    i32.shr_u
    i32.const 4
    i32.le_u
    if $I7
      unreachable
    end
    local.get $p3
    i32.load offset=4
    i32.const 16
    i32.add
    i32.load
    if $I8
      local.get $p3
      i32.load offset=8
      i32.const 2
      i32.shr_u
      i32.const 3
      i32.le_u
      if $I9
        unreachable
      end
      local.get $p3
      i32.load offset=8
      i32.const 2
      i32.shr_u
      i32.const 3
      i32.le_u
      if $I10
        unreachable
      end
      local.get $p3
      i32.load offset=8
      i32.const 2
      i32.shr_u
      i32.const 4
      i32.le_u
      if $I11
        unreachable
      end
      local.get $p2
      local.get $p3
      i32.load offset=4
      local.tee $l5
      i32.const 12
      i32.add
      i32.load
      local.tee $l6
      local.get $l6
      local.get $l5
      i32.const 16
      i32.add
      i32.load
      i32.add
      call $f27
      local.set $l5
    end
    local.get $p3
    i32.load offset=8
    i32.const 2
    i32.shr_u
    i32.const 5
    i32.le_u
    if $I12
      unreachable
    end
    local.get $p3
    i32.load offset=8
    i32.const 2
    i32.shr_u
    i32.const 5
    i32.le_u
    if $I13
      unreachable
    end
    local.get $p2
    local.get $p3
    i32.load offset=4
    i32.const 20
    i32.add
    i32.load
    local.tee $l6
    local.get $l6
    i32.const 1
    i32.add
    call $f27
    call $f28
    drop
    local.get $p3
    i32.load offset=8
    i32.const 2
    i32.shr_u
    i32.const 6
    i32.le_u
    if $I14
      unreachable
    end
    local.get $p3
    i32.load offset=8
    i32.const 2
    i32.shr_u
    i32.const 6
    i32.le_u
    if $I15
      unreachable
    end
    local.get $p2
    local.get $p3
    i32.load offset=4
    i32.const 24
    i32.add
    i32.load
    local.tee $l6
    local.get $l6
    i32.const 32
    i32.add
    call $f27
    drop
    local.get $p3
    i32.load offset=8
    i32.const 2
    i32.shr_u
    i32.const 7
    i32.le_u
    if $I16
      unreachable
    end
    local.get $p3
    i32.load offset=8
    i32.const 2
    i32.shr_u
    i32.const 7
    i32.le_u
    if $I17
      unreachable
    end
    local.get $p2
    local.get $p3
    i32.load offset=4
    i32.const 28
    i32.add
    i32.load
    local.tee $p2
    local.get $p2
    i32.const 32
    i32.add
    call $f27
    drop
    i32.const 20
    i32.const 14
    call $__new
    local.tee $p2
    local.get $p0
    i32.store
    local.get $p2
    local.get $l7
    i32.store offset=4
    local.get $p2
    local.get $p1
    i32.store offset=8
    local.get $p2
    local.get $l4
    i32.store offset=12
    local.get $p2
    local.get $l5
    i32.store offset=16
    local.get $p2)
  (func $f30 (export "f30") (type $t2) (result i32)
    (local $l0 i32) (local $l1 i32) (local $l2 i32) (local $l3 i32) (local $l4 i32) (local $l5 i32) (local $l6 i32) (local $l7 i32) (local $l8 i32) (local $l9 i32) (local $l10 i32) (local $l11 i32) (local $l12 i32) (local $l13 i32) (local $l14 i32) (local $l15 i32) (local $l16 i32) (local $l17 i32) (local $l18 i32) (local $l19 i64)
    i32.const 0
    call $env.wasm_input
    i32.wrap_i64
    local.tee $l16
    i64.extend_i32_s
    call $env.wasm_write_context
    i32.const 16
    call $f36
    local.set $l14
    loop $L0
      local.get $l15
      local.get $l16
      i32.lt_s
      if $I1
        i32.const 0
        call $env.wasm_input
        local.tee $l19
        call $env.wasm_write_context
        local.get $l19
        call $f17
        local.set $l10
        i32.const 0
        call $env.wasm_input
        i32.wrap_i64
        local.tee $l4
        i64.extend_i32_s
        call $env.wasm_write_context
        i32.const 0
        local.set $l0
        loop $L2
          local.get $l0
          local.get $l4
          i32.lt_s
          if $I3
            i32.const 12
            i32.const 6
            call $__new
            i32.const 20
            call $f8
            local.tee $l1
            i32.const 20
            i32.const 0
            i32.const 1
            call $f18
            local.get $l1
            i32.const 1
            call $f19
            call $f20
            local.set $l3
            i32.const 0
            call $env.wasm_input
            i32.wrap_i64
            local.tee $l6
            i64.extend_i32_s
            call $env.wasm_write_context
            i32.const 0
            local.set $l1
            loop $L4
              local.get $l1
              local.get $l6
              i32.lt_s
              if $I5
                i32.const 12
                i32.const 6
                call $__new
                i32.const 32
                call $f8
                local.tee $l8
                i32.const 32
                i32.const 0
                i32.const 1
                call $f18
                i32.const 1
                call $f19
                local.set $l5
                local.get $l3
                i32.load offset=4
                i32.const 8
                i32.const 11
                call $__new
                local.tee $l2
                local.get $l8
                i32.store
                local.get $l2
                local.get $l5
                i32.store offset=4
                local.get $l2
                call $f21
                local.get $l1
                i32.const 1
                i32.add
                local.set $l1
                br $L4
              end
            end
            local.get $l10
            i32.load offset=4
            local.get $l3
            call $f21
            local.get $l0
            i32.const 1
            i32.add
            local.set $l0
            br $L2
          end
        end
        i32.const 0
        call $env.wasm_input
        i32.wrap_i64
        i32.const 0
        i32.gt_s
        if $I6
          i32.const 0
          call $f19
          local.set $l8
          i32.const 12
          i32.const 19
          call $__new
          i32.const 7000
          i32.const 2
          call $f7
          local.set $l11
          local.get $l8
          i32.load offset=4
          local.set $l5
          local.get $l8
          i32.load offset=8
          local.set $l0
          local.get $l11
          i32.load offset=4
          local.set $l17
          i32.const 0
          local.set $l3
          global.get $g0_1
          i32.const 28000
          i32.sub
          local.tee $l6
          global.set $g0_1
          global.get $g0_1
          i32.const 32
          i32.sub
          local.tee $l1
          global.set $g0_1
          local.get $l1
          local.get $l5
          i32.store offset=28
          local.get $l1
          i32.const 0
          i32.store offset=24
          local.get $l1
          local.get $l0
          i32.store offset=20
          local.get $l1
          local.get $l6
          i32.store offset=16
          local.get $l1
          local.get $l1
          i32.load offset=24
          local.get $l1
          i32.load offset=20
          i32.add
          i32.const 1
          i32.sub
          i32.store offset=12
          local.get $l1
          local.get $l1
          i32.load offset=24
          i32.store offset=4
          local.get $l1
          i32.const 0
          i32.store
          loop $L7
            local.get $l1
            i32.load offset=4
            local.get $l1
            i32.load offset=12
            i32.lt_s
            if $I8
              local.get $l1
              i32.load offset=28
              local.set $l2
              local.get $l1
              i32.load offset=4
              local.set $l4
              local.get $l1
              i32.load
              local.set $l7
              local.get $l1
              i32.load offset=16
              local.set $l9
              global.get $g0_1
              i32.const -64
              i32.add
              local.tee $l0
              global.set $g0_1
              local.get $l0
              local.get $l2
              i32.store offset=60
              local.get $l0
              local.get $l4
              i32.store offset=56
              local.get $l0
              local.get $l1
              i32.const 8
              i32.add
              i32.store offset=52
              local.get $l0
              local.get $l7
              i32.store offset=48
              local.get $l0
              local.get $l9
              i32.store offset=44
              local.get $l0
              local.get $l0
              i32.load offset=60
              local.get $l0
              i32.load offset=56
              local.get $l0
              i32.const 40
              i32.add
              local.get $l0
              i32.const 36
              i32.add
              call $f3
              i32.store8 offset=35
              global.get $g0_1
              i32.const 16
              i32.sub
              local.tee $l2
              local.get $l0
              i32.load8_u offset=35
              i32.const 5
              i32.eq
              i32.store offset=12
              local.get $l2
              i32.load offset=12
              i32.eqz
              if $I9
                unreachable
              end
              local.get $l0
              local.get $l0
              i32.load offset=56
              local.get $l0
              i32.load offset=40
              i32.const 1
              i32.add
              i32.add
              i32.store offset=56
              local.get $l0
              local.get $l0
              i32.load offset=60
              local.get $l0
              i32.load offset=56
              local.get $l0
              i32.const 40
              i32.add
              local.get $l0
              i32.const 36
              i32.add
              call $f3
              i32.store8 offset=35
              global.get $g0_1
              i32.const 16
              i32.sub
              local.tee $l2
              local.get $l0
              i32.load8_u offset=35
              i32.const 1
              i32.ne
              if $I10 (result i32)
                local.get $l0
                i32.load8_u offset=35
                i32.const 2
                i32.eq
              else
                i32.const 1
              end
              i32.const 1
              i32.and
              i32.store offset=12
              local.get $l2
              i32.load offset=12
              i32.eqz
              if $I11
                unreachable
              end
              local.get $l0
              local.get $l0
              i32.load offset=56
              local.get $l0
              i32.load offset=36
              local.get $l0
              i32.load offset=40
              i32.const 1
              i32.add
              i32.add
              i32.add
              i32.store offset=56
              local.get $l0
              local.get $l0
              i32.load offset=60
              local.get $l0
              i32.load offset=56
              local.get $l0
              i32.const 40
              i32.add
              local.get $l0
              i32.const 36
              i32.add
              call $f3
              i32.store8 offset=35
              local.get $l0
              local.get $l0
              i32.load offset=56
              local.get $l0
              i32.load offset=36
              local.get $l0
              i32.load offset=40
              i32.const 1
              i32.add
              i32.add
              i32.add
              i32.store offset=56
              local.get $l0
              local.get $l0
              i32.load offset=60
              local.get $l0
              i32.load offset=56
              local.get $l0
              i32.const 40
              i32.add
              local.get $l0
              i32.const 36
              i32.add
              call $f3
              i32.store8 offset=35
              local.get $l0
              local.get $l0
              i32.load offset=56
              local.get $l0
              i32.load offset=36
              local.get $l0
              i32.load offset=40
              i32.const 1
              i32.add
              i32.add
              i32.add
              i32.store offset=56
              local.get $l0
              local.get $l0
              i32.load offset=60
              local.get $l0
              i32.load offset=56
              local.get $l0
              i32.const 40
              i32.add
              local.get $l0
              i32.const 36
              i32.add
              call $f3
              i32.store8 offset=35
              global.get $g0_1
              i32.const 16
              i32.sub
              local.tee $l2
              local.get $l0
              i32.load8_u offset=35
              i32.const 4
              i32.ne
              if $I12 (result i32)
                local.get $l0
                i32.load8_u offset=35
                i32.const 5
                i32.eq
              else
                i32.const 1
              end
              i32.const 1
              i32.and
              i32.store offset=12
              local.get $l2
              i32.load offset=12
              i32.eqz
              if $I13
                unreachable
              end
              local.get $l0
              local.get $l0
              i32.load offset=56
              local.get $l0
              i32.load offset=40
              i32.const 1
              i32.add
              i32.add
              i32.store offset=56
              local.get $l0
              local.get $l0
              i32.load offset=56
              local.get $l0
              i32.load offset=36
              i32.add
              i32.const 1
              i32.sub
              i32.store offset=28
              local.get $l0
              i32.const 0
              i32.store offset=12
              loop $L14
                block $B15
                  local.get $l0
                  i32.load offset=56
                  local.get $l0
                  i32.load offset=28
                  i32.gt_s
                  br_if $B15
                  local.get $l0
                  local.get $l0
                  i32.load offset=60
                  local.get $l0
                  i32.load offset=56
                  local.get $l0
                  i32.const 40
                  i32.add
                  local.get $l0
                  i32.const 36
                  i32.add
                  call $f3
                  i32.store8 offset=35
                  global.get $g0_1
                  i32.const 16
                  i32.sub
                  local.tee $l2
                  local.get $l0
                  i32.load8_u offset=35
                  i32.const 4
                  i32.ne
                  if $I16 (result i32)
                    local.get $l0
                    i32.load8_u offset=35
                    i32.const 5
                    i32.eq
                  else
                    i32.const 1
                  end
                  i32.const 1
                  i32.and
                  i32.store offset=12
                  local.get $l2
                  i32.load offset=12
                  i32.eqz
                  if $I17
                    unreachable
                  end
                  local.get $l0
                  local.get $l0
                  i32.load offset=40
                  local.get $l0
                  i32.load offset=56
                  i32.const 1
                  i32.add
                  i32.add
                  i32.store offset=24
                  local.get $l0
                  i32.load offset=60
                  local.get $l0
                  i32.load offset=24
                  local.get $l0
                  i32.const 20
                  i32.add
                  local.get $l0
                  i32.const 16
                  i32.add
                  call $f3
                  drop
                  local.get $l0
                  i32.load offset=44
                  local.get $l0
                  i32.load offset=48
                  local.get $l0
                  i32.load offset=12
                  i32.add
                  i32.const 28
                  i32.mul
                  i32.add
                  local.get $l0
                  i32.load offset=24
                  local.get $l0
                  i32.load offset=20
                  i32.add
                  i32.const 1
                  i32.add
                  i32.store
                  local.get $l0
                  local.get $l0
                  i32.load offset=24
                  local.get $l0
                  i32.load offset=16
                  local.get $l0
                  i32.load offset=20
                  i32.const 1
                  i32.add
                  i32.add
                  i32.add
                  i32.store offset=24
                  local.get $l0
                  i32.load offset=24
                  local.get $l0
                  i32.load offset=28
                  i32.gt_s
                  br_if $B15
                  local.get $l0
                  local.get $l0
                  i32.load offset=60
                  local.get $l0
                  i32.load offset=24
                  local.get $l0
                  i32.const 20
                  i32.add
                  local.get $l0
                  i32.const 16
                  i32.add
                  call $f3
                  i32.store8 offset=35
                  block $B18
                    local.get $l0
                    i32.load8_u offset=35
                    i32.const 4
                    i32.ne
                    if $I19
                      local.get $l0
                      i32.load8_u offset=35
                      i32.const 5
                      i32.ne
                      br_if $B18
                    end
                    local.get $l0
                    local.get $l0
                    i32.load offset=16
                    i32.const 33
                    i32.div_s
                    i32.store offset=8
                    local.get $l0
                    local.get $l0
                    i32.load offset=24
                    local.get $l0
                    i32.load offset=20
                    i32.const 1
                    i32.add
                    i32.add
                    i32.store offset=24
                    local.get $l0
                    i32.const 1
                    i32.store offset=4
                    loop $L20
                      local.get $l0
                      i32.load offset=4
                      local.get $l0
                      i32.load offset=8
                      i32.le_s
                      if $I21
                        local.get $l0
                        local.get $l0
                        i32.load offset=60
                        local.get $l0
                        i32.load offset=24
                        local.get $l0
                        i32.const 20
                        i32.add
                        local.get $l0
                        i32.const 16
                        i32.add
                        call $f3
                        i32.store8 offset=35
                        global.get $g0_1
                        i32.const 16
                        i32.sub
                        local.tee $l2
                        local.get $l0
                        i32.load8_u offset=35
                        i32.const 2
                        i32.eq
                        i32.store offset=12
                        local.get $l2
                        i32.load offset=12
                        i32.eqz
                        if $I22
                          unreachable
                        end
                        global.get $g0_1
                        i32.const 16
                        i32.sub
                        local.tee $l2
                        local.get $l0
                        i32.load offset=16
                        i32.const 32
                        i32.eq
                        i32.store offset=12
                        local.get $l2
                        i32.load offset=12
                        i32.eqz
                        if $I23
                          unreachable
                        end
                        local.get $l0
                        i32.load offset=44
                        local.get $l0
                        i32.load offset=48
                        local.get $l0
                        i32.load offset=12
                        i32.add
                        i32.const 28
                        i32.mul
                        i32.add
                        local.get $l0
                        i32.load offset=4
                        i32.const 2
                        i32.shl
                        i32.add
                        local.get $l0
                        i32.load offset=24
                        i32.const 1
                        i32.add
                        i32.store
                        local.get $l0
                        local.get $l0
                        i32.load offset=24
                        i32.const 33
                        i32.add
                        i32.store offset=24
                        local.get $l0
                        local.get $l0
                        i32.load offset=4
                        i32.const 1
                        i32.add
                        i32.store offset=4
                        br $L20
                      end
                    end
                  end
                  local.get $l0
                  i32.load offset=24
                  local.get $l0
                  i32.load offset=28
                  i32.gt_s
                  br_if $B15
                  local.get $l0
                  local.get $l0
                  i32.load offset=60
                  local.get $l0
                  i32.load offset=24
                  local.get $l0
                  i32.const 20
                  i32.add
                  local.get $l0
                  i32.const 16
                  i32.add
                  call $f3
                  i32.store8 offset=35
                  global.get $g0_1
                  i32.const 16
                  i32.sub
                  local.tee $l2
                  local.get $l0
                  i32.load8_u offset=35
                  i32.const 2
                  i32.ne
                  if $I24 (result i32)
                    local.get $l0
                    i32.load8_u offset=35
                    i32.const 3
                    i32.eq
                  else
                    i32.const 1
                  end
                  i32.const 1
                  i32.and
                  i32.store offset=12
                  local.get $l2
                  i32.load offset=12
                  if $I25
                    local.get $l0
                    i32.load offset=44
                    local.get $l0
                    i32.load offset=48
                    local.get $l0
                    i32.load offset=12
                    i32.add
                    i32.const 28
                    i32.mul
                    i32.add
                    local.get $l0
                    i32.load offset=24
                    local.get $l0
                    i32.load offset=20
                    i32.add
                    i32.const 1
                    i32.add
                    i32.store offset=20
                    local.get $l0
                    i32.load offset=44
                    local.get $l0
                    i32.load offset=48
                    local.get $l0
                    i32.load offset=12
                    i32.add
                    i32.const 28
                    i32.mul
                    i32.add
                    local.get $l0
                    i32.load offset=16
                    local.get $l0
                    i32.load offset=24
                    local.get $l0
                    i32.load offset=20
                    i32.add
                    i32.add
                    i32.store offset=24
                    local.get $l0
                    local.get $l0
                    i32.load offset=56
                    local.get $l0
                    i32.load offset=36
                    local.get $l0
                    i32.load offset=40
                    i32.const 1
                    i32.add
                    i32.add
                    i32.add
                    i32.store offset=56
                    local.get $l0
                    local.get $l0
                    i32.load offset=12
                    i32.const 1
                    i32.add
                    i32.store offset=12
                    br $L14
                  else
                    unreachable
                  end
                  unreachable
                end
              end
              global.get $g0_1
              i32.const 16
              i32.sub
              local.tee $l2
              local.get $l0
              i32.load offset=56
              local.get $l0
              i32.load offset=28
              i32.const 1
              i32.add
              i32.eq
              i32.store offset=12
              local.get $l2
              i32.load offset=12
              i32.eqz
              if $I26
                unreachable
              end
              local.get $l0
              i32.load offset=52
              local.get $l0
              i32.load offset=28
              i32.store
              local.get $l0
              i32.load offset=12
              local.set $l2
              local.get $l0
              i32.const -64
              i32.sub
              global.set $g0_1
              local.get $l1
              local.get $l1
              i32.load
              local.get $l2
              i32.add
              i32.store
              local.get $l1
              local.get $l1
              i32.load offset=8
              i32.const 1
              i32.add
              i32.store offset=4
              br $L7
            end
          end
          local.get $l1
          i32.load
          local.set $l0
          local.get $l1
          i32.const 32
          i32.add
          global.set $g0_1
          local.get $l6
          local.get $l0
          local.tee $l2
          i32.const 2
          i32.shl
          i32.const 15
          i32.add
          i32.const -16
          i32.and
          i32.sub
          local.tee $l4
          global.set $g0_1
          local.get $l0
          i32.const 0
          i32.gt_s
          if $I27
            local.get $l2
            i32.const 7
            i32.and
            local.set $l0
            local.get $l2
            i32.const 1
            i32.sub
            i32.const 7
            i32.ge_u
            if $I28
              local.get $l4
              i32.const 28
              i32.add
              local.set $l1
              local.get $l2
              i32.const -8
              i32.and
              local.set $l7
              loop $L29
                local.get $l1
                i32.const 4
                i32.sub
                i64.const 0
                i64.store
                local.get $l1
                i32.const 12
                i32.sub
                i64.const 0
                i64.store
                local.get $l1
                i32.const 20
                i32.sub
                i64.const 0
                i64.store
                local.get $l1
                i32.const 28
                i32.sub
                i64.const 0
                i64.store
                local.get $l1
                i32.const 32
                i32.add
                local.set $l1
                local.get $l7
                local.get $l3
                i32.const 8
                i32.add
                local.tee $l3
                i32.ne
                br_if $L29
              end
            end
            local.get $l0
            if $I30
              local.get $l4
              local.get $l3
              i32.const 2
              i32.shl
              i32.add
              local.set $l1
              loop $L31
                local.get $l1
                i32.const 0
                i32.store
                local.get $l1
                i32.const 4
                i32.add
                local.set $l1
                local.get $l0
                i32.const 1
                i32.sub
                local.tee $l0
                br_if $L31
              end
            end
            i32.const 0
            local.set $l1
            i32.const 0
            local.set $l3
            loop $L32
              block $B33
                local.get $l5
                local.get $l6
                local.get $l1
                i32.const 28
                i32.mul
                i32.add
                local.tee $l9
                i32.load
                i32.add
                local.tee $l0
                i32.load8_u
                i32.const 92
                i32.ne
                br_if $B33
                local.get $l0
                i32.const 1
                i32.add
                i32.load8_u
                i32.const 122
                i32.ne
                br_if $B33
                local.get $l0
                i32.const 2
                i32.add
                i32.load8_u
                i32.const 108
                i32.ne
                br_if $B33
                local.get $l0
                i32.const 3
                i32.add
                i32.load8_u
                i32.const 242
                i32.ne
                br_if $B33
                local.get $l0
                i32.const 4
                i32.add
                i32.load8_u
                i32.const 12
                i32.ne
                br_if $B33
                local.get $l0
                i32.const 5
                i32.add
                i32.load8_u
                i32.const 189
                i32.ne
                br_if $B33
                local.get $l0
                i32.const 6
                i32.add
                i32.load8_u
                i32.const 62
                i32.ne
                br_if $B33
                local.get $l0
                i32.const 7
                i32.add
                i32.load8_u
                i32.const 239
                i32.ne
                br_if $B33
                local.get $l0
                i32.const 8
                i32.add
                i32.load8_u
                i32.const 50
                i32.ne
                br_if $B33
                local.get $l0
                i32.const 9
                i32.add
                i32.load8_u
                i32.const 225
                i32.ne
                br_if $B33
                local.get $l0
                i32.const 10
                i32.add
                i32.load8_u
                i32.const 155
                i32.ne
                br_if $B33
                local.get $l0
                i32.const 11
                i32.add
                i32.load8_u
                i32.const 156
                i32.ne
                br_if $B33
                local.get $l0
                i32.const 12
                i32.add
                i32.load8_u
                i32.const 173
                i32.ne
                br_if $B33
                local.get $l0
                i32.const 13
                i32.add
                i32.load8_u
                i32.const 78
                i32.ne
                br_if $B33
                local.get $l0
                i32.const 14
                i32.add
                i32.load8_u
                i32.const 202
                i32.ne
                br_if $B33
                local.get $l0
                i32.const 15
                i32.add
                i32.load8_u
                i32.const 23
                i32.ne
                br_if $B33
                local.get $l0
                i32.const 16
                i32.add
                i32.load8_u
                i32.const 196
                i32.ne
                br_if $B33
                local.get $l0
                i32.const 17
                i32.add
                i32.load8_u
                i32.const 50
                i32.ne
                br_if $B33
                local.get $l0
                i32.const 18
                i32.add
                i32.load8_u
                i32.const 167
                i32.ne
                br_if $B33
                local.get $l0
                i32.const 19
                i32.add
                i32.load8_u
                i32.const 148
                i32.ne
                br_if $B33
                local.get $l4
                local.get $l1
                i32.const 2
                i32.shl
                i32.add
                local.set $l7
                block $B34
                  local.get $l5
                  local.get $l9
                  i32.const 4
                  i32.add
                  i32.load
                  i32.add
                  local.tee $l9
                  i32.load8_u
                  local.tee $l12
                  i32.const 146
                  i32.ne
                  br_if $B34
                  i32.const 0
                  local.set $l0
                  block $B35
                    block $B36
                      loop $L37
                        local.get $l0
                        local.get $l9
                        i32.add
                        local.tee $l13
                        i32.const 1
                        i32.add
                        i32.load8_u
                        local.get $l0
                        i32.const 65538
                        i32.add
                        i32.load8_u
                        i32.ne
                        br_if $B36
                        local.get $l0
                        i32.const 30
                        i32.eq
                        br_if $B35
                        local.get $l0
                        i32.const 65539
                        i32.add
                        local.set $l18
                        local.get $l0
                        i32.const 2
                        i32.add
                        local.set $l0
                        local.get $l13
                        i32.const 2
                        i32.add
                        i32.load8_u
                        local.get $l18
                        i32.load8_u
                        i32.eq
                        br_if $L37
                      end
                      local.get $l0
                      i32.const 1
                      i32.sub
                      local.set $l0
                    end
                    local.get $l0
                    i32.const 31
                    i32.lt_u
                    br_if $B34
                  end
                  local.get $l7
                  i32.const 1
                  i32.store
                  local.get $l3
                  i32.const 1
                  i32.add
                  local.set $l3
                end
                local.get $l12
                i32.const 99
                i32.ne
                br_if $B33
                i32.const 0
                local.set $l0
                block $B38
                  block $B39
                    loop $L40
                      local.get $l0
                      local.get $l9
                      i32.add
                      local.tee $l12
                      i32.const 1
                      i32.add
                      i32.load8_u
                      local.get $l0
                      i32.const 65570
                      i32.add
                      i32.load8_u
                      i32.ne
                      br_if $B39
                      local.get $l0
                      i32.const 30
                      i32.eq
                      br_if $B38
                      local.get $l0
                      i32.const 65571
                      i32.add
                      local.set $l13
                      local.get $l0
                      i32.const 2
                      i32.add
                      local.set $l0
                      local.get $l12
                      i32.const 2
                      i32.add
                      i32.load8_u
                      local.get $l13
                      i32.load8_u
                      i32.eq
                      br_if $L40
                    end
                    local.get $l0
                    i32.const 1
                    i32.sub
                    local.set $l0
                  end
                  local.get $l0
                  i32.const 31
                  i32.lt_u
                  br_if $B33
                end
                local.get $l7
                i32.const 1
                i32.store
                local.get $l3
                i32.const 1
                i32.add
                local.set $l3
              end
              local.get $l1
              i32.const 1
              i32.add
              local.tee $l1
              local.get $l2
              i32.ne
              br_if $L32
            end
            local.get $l6
            i32.const 24
            i32.add
            local.set $l1
            i32.const 0
            local.set $l5
            loop $L41
              local.get $l4
              i32.load
              if $I42
                local.get $l17
                local.get $l5
                i32.const 28
                i32.mul
                i32.add
                local.tee $l0
                local.get $l1
                i32.const 24
                i32.sub
                i32.load
                i32.store
                local.get $l0
                i32.const 4
                i32.add
                local.get $l1
                i32.const 20
                i32.sub
                i64.load align=4
                i64.store align=4
                local.get $l0
                i32.const 12
                i32.add
                local.get $l1
                i32.const 12
                i32.sub
                i64.load align=4
                i64.store align=4
                local.get $l0
                i32.const 20
                i32.add
                local.get $l1
                i32.const 4
                i32.sub
                i32.load
                local.tee $l7
                i32.store
                local.get $l0
                i32.const 24
                i32.add
                local.get $l1
                i32.load
                local.get $l7
                i32.sub
                i32.const 1
                i32.add
                i32.store
                local.get $l5
                i32.const 1
                i32.add
                local.set $l5
              end
              local.get $l4
              i32.const 4
              i32.add
              local.set $l4
              local.get $l1
              i32.const 28
              i32.add
              local.set $l1
              local.get $l2
              i32.const 1
              i32.sub
              local.tee $l2
              br_if $L41
            end
          end
          local.get $l6
          i32.const 28000
          i32.add
          global.set $g0_1
          local.get $l10
          local.get $l8
          i32.load offset=4
          local.get $l3
          local.get $l11
          i32.load offset=4
          call $f24
          call $f26
        end
        i32.const 0
        call $env.wasm_input
        i32.wrap_i64
        local.set $l2
        i32.const 0
        local.set $l1
        loop $L43
          local.get $l1
          local.get $l2
          i32.lt_s
          if $I44
            i32.const 12
            i32.const 6
            call $__new
            i32.const 32
            call $f8
            local.tee $l4
            i32.const 32
            i32.const 0
            i32.const 0
            call $f18
            i32.const 12
            i32.const 6
            call $__new
            i32.const 20
            call $f8
            local.tee $l6
            i32.const 20
            i32.const 0
            i32.const 0
            call $f18
            i32.const 0
            call $f19
            local.set $l8
            i32.const 12
            i32.const 19
            call $__new
            i32.const 8
            i32.const 2
            call $f7
            local.set $l3
            i32.const 0
            local.set $l0
            loop $L45
              local.get $l0
              i32.const 8
              i32.lt_s
              if $I46
                i32.const 0
                call $env.wasm_input
                i32.wrap_i64
                local.set $l5
                local.get $l0
                local.get $l3
                i32.load offset=8
                i32.const 2
                i32.shr_u
                i32.ge_u
                if $I47
                  unreachable
                end
                local.get $l3
                i32.load offset=4
                local.get $l0
                i32.const 2
                i32.shl
                i32.add
                local.get $l5
                i32.store
                local.get $l0
                i32.const 1
                i32.add
                local.set $l0
                br $L45
              end
            end
            local.get $l4
            local.get $l6
            local.get $l8
            local.get $l3
            call $f29
            local.set $l0
            local.get $l10
            i32.load offset=8
            local.get $l0
            call $f21
            local.get $l1
            i32.const 1
            i32.add
            local.set $l1
            br $L43
          end
        end
        local.get $l14
        local.get $l10
        call $f21
        local.get $l15
        i32.const 1
        i32.add
        local.set $l15
        br $L0
      end
    end
    local.get $l14)
  (func $zkmain (export "zkmain") (type $t5)
    (local $l0 i32) (local $l1 i32) (local $l2 i32) (local $l3 i32)
    global.get $g3
    i32.eqz
    if $I0
      i32.const 1
      global.set $g3
      i32.const 70716
      global.set $g0
    end
    i32.const 70608
    global.set $g1
    call $f30
    call $f30
    local.set $l1
    i32.const 1
    call $env.wasm_input
    i32.wrap_i64
    local.set $l0
    local.get $l1
    i32.load offset=12
    i32.eqz
    if $I1
      unreachable
    end
    local.get $l1
    i32.load offset=4
    i32.load
    local.tee $l2
    i32.eqz
    if $I2
      unreachable
    end
    local.get $l2
    i64.load offset=16
    local.get $l0
    i64.extend_i32_s
    i64.eq
    call $env.require
    i32.const 1
    call $env.wasm_input
    i32.wrap_i64
    local.set $l0
    i32.const 12
    i32.const 6
    call $__new
    local.get $l0
    call $f8
    local.tee $l2
    local.get $l0
    i32.const 1
    i32.const 0
    call $f18
    local.get $l1
    global.get $g1
    i32.load
    call_indirect $T0 (type $t0)
    local.get $l2
    i32.const 0
    call $f25
    i32.const 0
    i32.ne
    call $env.require)
  (func $asmain (export "asmain") (type $t2) (result i32)
    (local $l0 i32) (local $l1 i32) (local $l2 i32) (local $l3 i32) (local $l4 i32) (local $l5 i32) (local $l6 i32) (local $l7 i32) (local $l8 i32) (local $l9 i32) (local $l10 i32) (local $l11 i32) (local $l12 i32)
    global.get $g3
    i32.eqz
    if $I0
      i32.const 1
      global.set $g3
      i32.const 70716
      global.set $g0
    end
    i32.const 70608
    global.set $g1
    i32.const 0
    call $env.wasm_input
    i32.wrap_i64
    local.set $l11
    i32.const 16
    call $f36
    local.set $l9
    loop $L1
      local.get $l10
      local.get $l11
      i32.lt_s
      if $I2
        i32.const 0
        call $env.wasm_input
        call $f17
        local.set $l2
        i32.const 0
        call $env.wasm_input
        i32.wrap_i64
        local.set $l5
        i32.const 0
        local.set $l0
        loop $L3
          local.get $l0
          local.get $l5
          i32.lt_s
          if $I4
            i32.const 12
            i32.const 6
            call $__new
            i32.const 20
            call $f8
            local.tee $l1
            i32.const 20
            i32.const 0
            i32.const 1
            call $f18
            local.get $l1
            i32.const 1
            call $f19
            call $f20
            local.set $l3
            i32.const 0
            call $env.wasm_input
            i32.wrap_i64
            local.set $l6
            i32.const 0
            local.set $l1
            loop $L5
              local.get $l1
              local.get $l6
              i32.lt_s
              if $I6
                i32.const 12
                i32.const 6
                call $__new
                i32.const 32
                call $f8
                local.tee $l7
                i32.const 32
                i32.const 0
                i32.const 1
                call $f18
                i32.const 1
                call $f19
                local.set $l8
                local.get $l3
                i32.load offset=4
                i32.const 8
                i32.const 11
                call $__new
                local.tee $l4
                local.get $l7
                i32.store
                local.get $l4
                local.get $l8
                i32.store offset=4
                local.get $l4
                call $f21
                local.get $l1
                i32.const 1
                i32.add
                local.set $l1
                br $L5
              end
            end
            local.get $l2
            i32.load offset=4
            local.get $l3
            call $f21
            local.get $l0
            i32.const 1
            i32.add
            local.set $l0
            br $L3
          end
        end
        i32.const 0
        call $env.wasm_input
        i32.wrap_i64
        i32.const 0
        i32.gt_s
        if $I7
          i32.const 0
          call $f19
          local.set $l1
          i32.const 0
          call $f19
          local.set $l0
          local.get $l2
          local.get $l1
          i32.load offset=4
          local.get $l0
          i32.load offset=8
          i32.const 2
          i32.shr_u
          i32.const 7
          i32.div_u
          local.get $l0
          i32.load offset=4
          call $f24
          call $f26
        end
        i32.const 0
        call $env.wasm_input
        i32.wrap_i64
        local.set $l4
        i32.const 0
        local.set $l1
        loop $L8
          local.get $l1
          local.get $l4
          i32.lt_s
          if $I9
            i32.const 12
            i32.const 6
            call $__new
            i32.const 32
            call $f8
            local.tee $l5
            i32.const 32
            i32.const 0
            i32.const 0
            call $f18
            i32.const 12
            i32.const 6
            call $__new
            i32.const 20
            call $f8
            local.tee $l6
            i32.const 20
            i32.const 0
            i32.const 0
            call $f18
            i32.const 0
            call $f19
            local.set $l7
            i32.const 12
            i32.const 19
            call $__new
            i32.const 8
            i32.const 2
            call $f7
            local.set $l3
            i32.const 0
            local.set $l0
            loop $L10
              local.get $l0
              i32.const 8
              i32.lt_s
              if $I11
                i32.const 0
                call $env.wasm_input
                i32.wrap_i64
                local.set $l8
                local.get $l0
                local.get $l3
                i32.load offset=8
                i32.const 2
                i32.shr_u
                i32.ge_u
                if $I12
                  unreachable
                end
                local.get $l3
                i32.load offset=4
                local.get $l0
                i32.const 2
                i32.shl
                i32.add
                local.get $l8
                i32.store
                local.get $l0
                i32.const 1
                i32.add
                local.set $l0
                br $L10
              end
            end
            local.get $l5
            local.get $l6
            local.get $l7
            local.get $l3
            call $f29
            local.set $l0
            local.get $l2
            i32.load offset=8
            local.get $l0
            call $f21
            local.get $l1
            i32.const 1
            i32.add
            local.set $l1
            br $L8
          end
        end
        local.get $l9
        local.get $l2
        call $f21
        local.get $l10
        i32.const 1
        i32.add
        local.set $l10
        br $L1
      end
    end
    call $f30
    local.set $l0
    i32.const 1
    call $env.wasm_input
    i32.wrap_i64
    local.set $l1
    local.get $l0
    i32.load offset=12
    i32.eqz
    if $I13
      unreachable
    end
    local.get $l0
    i32.load offset=4
    i32.load
    local.tee $l2
    i32.eqz
    if $I14
      unreachable
    end
    local.get $l2
    i64.load offset=16
    local.get $l1
    i64.extend_i32_s
    i64.eq
    call $env.require
    local.get $l9
    local.get $l0
    global.get $g1
    i32.load
    call_indirect $T0 (type $t0))
  (func $__unpin (export "__unpin") (type $t6) (param $p0 i32)
    nop)
  (func $__collect (export "__collect") (type $t5)
    nop)
  (func $__as_start (export "__as_start") (type $t5)
    global.get $g3
    if $I0
      return
    end
    i32.const 1
    global.set $g3
    i32.const 70716
    global.set $g0)
  (func $f36 (export "f36") (type $t3) (param $p0 i32) (result i32)
    (local $l1 i32)
    i32.const 16
    local.get $p0
    call $__new
    local.tee $p0
    i32.const 0
    i32.store
    local.get $p0
    i32.const 0
    i32.store offset=4
    local.get $p0
    i32.const 0
    i32.store offset=8
    local.get $p0
    i32.const 0
    i32.store offset=12
    i32.const 32
    i32.const 1
    call $__new
    local.tee $l1
    i32.const 32
    call $f6
    local.get $p0
    local.get $l1
    i32.store
    local.get $p0
    local.get $l1
    i32.store offset=4
    local.get $p0
    i32.const 32
    i32.store offset=8
    local.get $p0
    i32.const 0
    i32.store offset=12
    local.get $p0)
  (table $T0 (export "T0") 3 3 funcref)
  (memory $memory (export "memory") 20 20)
  (global $g0_1 (mut i32) (i32.const 65536))
  (global $g0 (export "g0") (mut i32) (i32.const 0))
  (global $g1 (export "g1") (mut i32) (i32.const 70272))
  (global $__rtti_base (export "__rtti_base") i32 (i32.const 70624))
  (global $g3 (export "g3") (mut i32) (i32.const 0))
  (data $d0 (i32.const 65536) "\02\92\e9\84#\f8\ad\acnd\d0`\8eQ\9f\d1\ce\fb\86\14\988\5cm\eep\d5\8f\c9&\dd\c6\8ccuM\c9S\9d\da\81\8b\81^\a6\0e\cf20XO'\a9\8b\81^\a6\0e\cf20\959\dd\84")
  (elem (;0;) (i32.const 1) func $f9 $f14)
  (data $d0 (i32.const 70012) ",")
  (data $d1 (i32.const 70024) "\02\00\00\00\1c\00\00\00I\00n\00v\00a\00l\00i\00d\00 \00l\00e\00n\00g\00t\00h")
  (data $d2 (i32.const 70060) "<")
  (data $d3 (i32.const 70072) "\02\00\00\00&\00\00\00~\00l\00i\00b\00/\00a\00r\00r\00a\00y\00b\00u\00f\00f\00e\00r\00.\00t\00s")
  (data $d4 (i32.const 70124) "<")
  (data $d5 (i32.const 70136) "\02\00\00\00(\00\00\00A\00l\00l\00o\00c\00a\00t\00i\00o\00n\00 \00t\00o\00o\00 \00l\00a\00r\00g\00e")
  (data $d6 (i32.const 70188) "<")
  (data $d7 (i32.const 70200) "\02\00\00\00\1e\00\00\00~\00l\00i\00b\00/\00r\00t\00/\00s\00t\00u\00b\00.\00t\00s")
  (data $d8 (i32.const 70252) "\1c")
  (data $d9 (i32.const 70264) "\11\00\00\00\08\00\00\00\01")
  (data $d10 (i32.const 70284) "<")
  (data $d11 (i32.const 70296) "\02\00\00\00$\00\00\00I\00n\00d\00e\00x\00 \00o\00u\00t\00 \00o\00f\00 \00r\00a\00n\00g\00e")
  (data $d12 (i32.const 70348) ",")
  (data $d13 (i32.const 70360) "\02\00\00\00\1a\00\00\00~\00l\00i\00b\00/\00a\00r\00r\00a\00y\00.\00t\00s")
  (data $d14 (i32.const 70396) "|")
  (data $d15 (i32.const 70408) "\02\00\00\00^\00\00\00E\00l\00e\00m\00e\00n\00t\00 \00t\00y\00p\00e\00 \00m\00u\00s\00t\00 \00b\00e\00 \00n\00u\00l\00l\00a\00b\00l\00e\00 \00i\00f\00 \00a\00r\00r\00a\00y\00 \00i\00s\00 \00h\00o\00l\00e\00y")
  (data $d16 (i32.const 70524) "<")
  (data $d17 (i32.const 70536) "\02\00\00\00$\00\00\00~\00l\00i\00b\00/\00t\00y\00p\00e\00d\00a\00r\00r\00a\00y\00.\00t\00s")
  (data $d18 (i32.const 70588) "\1c")
  (data $d19 (i32.const 70600) "\11\00\00\00\08\00\00\00\02")
  (data $d20 (i32.const 70624) "\15\00\00\00 \00\00\00 \00\00\00 ")
  (data $d21 (i32.const 70652) "A\00\00\00A\00\00\00A\00\00\00\02A")
  (data $d22 (i32.const 70676) "\02A\00\00\02A\00\00\00\00\00\00\02A\00\00\02A\00\00\00\00\00\00\01\02\00\00\01\01\00\00 "))
